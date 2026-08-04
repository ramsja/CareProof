import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { CareProofRegistry } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const ZERO_HASH = ethers.ZeroHash;
const SAMPLE_HASH = ethers.keccak256(ethers.toUtf8Bytes("sample record data"));
const SAMPLE_HASH_2 = ethers.keccak256(ethers.toUtf8Bytes("different record data"));

describe("CareProofRegistry", () => {
  let registry: CareProofRegistry;
  let owner: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let viewer: HardhatEthersSigner;
  let stranger: HardhatEthersSigner;

  beforeEach(async () => {
    [owner, creator, viewer, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CareProofRegistry");
    registry = (await Factory.deploy()) as CareProofRegistry;
    await registry.waitForDeployment();
  });

  // ── registerRecord ──────────────────────────────────────────────────────────

  describe("registerRecord", () => {
    it("assigns ID 1 to the first record", async () => {
      const tx = await registry.connect(creator).registerRecord(SAMPLE_HASH, owner.address);
      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      const event = receipt!.logs
        .map((log) => {
          try { return registry.interface.parseLog(log); } catch { return null; }
        })
        .find((e) => e?.name === "RecordRegistered");

      expect(event?.args.recordId).to.equal(1n);
    });

    it("stores the correct owner and creator", async () => {
      await registry.connect(creator).registerRecord(SAMPLE_HASH, owner.address);
      const [, storedOwner, storedCreator, , active] = await registry.getRecord(1);
      expect(storedOwner).to.equal(owner.address);
      expect(storedCreator).to.equal(creator.address);
      expect(active).to.be.true;
    });

    it("emits RecordRegistered with correct arguments", async () => {
      const tx = await registry.connect(creator).registerRecord(SAMPLE_HASH, owner.address);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      const ts = BigInt(block!.timestamp);
      await expect(tx)
        .to.emit(registry, "RecordRegistered")
        .withArgs(1n, SAMPLE_HASH, owner.address, creator.address, ts);
    });

    it("increments the record ID for each registration", async () => {
      await registry.connect(creator).registerRecord(SAMPLE_HASH, owner.address);
      await registry.connect(creator).registerRecord(SAMPLE_HASH_2, owner.address);
      expect((await registry.getRecord(1))[0]).to.equal(SAMPLE_HASH);
      expect((await registry.getRecord(2))[0]).to.equal(SAMPLE_HASH_2);
    });

    it("reverts on zero hash", async () => {
      await expect(
        registry.connect(creator).registerRecord(ZERO_HASH as `0x${string}`, owner.address),
      ).to.be.revertedWithCustomError(registry, "ZeroHash");
    });

    it("reverts on zero-address owner", async () => {
      await expect(
        registry.connect(creator).registerRecord(SAMPLE_HASH, ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(registry, "ZeroAddress");
    });
  });

  // ── getRecord ───────────────────────────────────────────────────────────────

  describe("getRecord", () => {
    it("reverts for a nonexistent record", async () => {
      await expect(registry.getRecord(999)).to.be.revertedWithCustomError(
        registry,
        "RecordDoesNotExist",
      );
    });
  });

  // ── verifyRecord ────────────────────────────────────────────────────────────

  describe("verifyRecord", () => {
    beforeEach(async () => {
      await registry.connect(creator).registerRecord(SAMPLE_HASH, owner.address);
    });

    it("returns true when hashes match", async () => {
      expect(await registry.verifyRecord(1, SAMPLE_HASH)).to.be.true;
    });

    it("returns false when hashes differ", async () => {
      expect(await registry.verifyRecord(1, SAMPLE_HASH_2)).to.be.false;
    });

    it("reverts for nonexistent record", async () => {
      await expect(registry.verifyRecord(99, SAMPLE_HASH)).to.be.revertedWithCustomError(
        registry,
        "RecordDoesNotExist",
      );
    });
  });

  // ── grantAccess ─────────────────────────────────────────────────────────────

  describe("grantAccess", () => {
    beforeEach(async () => {
      await registry.connect(owner).registerRecord(SAMPLE_HASH, owner.address);
    });

    it("grants access and emits AccessGranted", async () => {
      const tx = await registry.connect(owner).grantAccess(1, viewer.address);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      const ts = BigInt(block!.timestamp);
      await expect(tx)
        .to.emit(registry, "AccessGranted")
        .withArgs(1n, owner.address, viewer.address, ts);
      expect(await registry.hasAccess(1, viewer.address)).to.be.true;
    });

    it("reverts when called by non-owner", async () => {
      await expect(
        registry.connect(stranger).grantAccess(1, viewer.address),
      ).to.be.revertedWithCustomError(registry, "NotOwner");
    });

    it("reverts on zero-address viewer", async () => {
      await expect(
        registry.connect(owner).grantAccess(1, ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(registry, "ZeroAddress");
    });

    it("reverts when granting access to the owner", async () => {
      await expect(
        registry.connect(owner).grantAccess(1, owner.address),
      ).to.be.revertedWithCustomError(registry, "CannotGrantToOwner");
    });

    it("reverts on duplicate grant", async () => {
      await registry.connect(owner).grantAccess(1, viewer.address);
      await expect(
        registry.connect(owner).grantAccess(1, viewer.address),
      ).to.be.revertedWithCustomError(registry, "AccessAlreadyGranted");
    });

    it("reverts when record is deactivated", async () => {
      await registry.connect(owner).deactivateRecord(1);
      await expect(
        registry.connect(owner).grantAccess(1, viewer.address),
      ).to.be.revertedWithCustomError(registry, "RecordInactive");
    });
  });

  // ── revokeAccess ────────────────────────────────────────────────────────────

  describe("revokeAccess", () => {
    beforeEach(async () => {
      await registry.connect(owner).registerRecord(SAMPLE_HASH, owner.address);
      await registry.connect(owner).grantAccess(1, viewer.address);
    });

    it("revokes access and emits AccessRevoked", async () => {
      const tx = await registry.connect(owner).revokeAccess(1, viewer.address);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      const ts = BigInt(block!.timestamp);
      await expect(tx)
        .to.emit(registry, "AccessRevoked")
        .withArgs(1n, owner.address, viewer.address, ts);
      expect(await registry.hasAccess(1, viewer.address)).to.be.false;
    });

    it("reverts when called by non-owner", async () => {
      await expect(
        registry.connect(stranger).revokeAccess(1, viewer.address),
      ).to.be.revertedWithCustomError(registry, "NotOwner");
    });

    it("reverts when access does not exist", async () => {
      await expect(
        registry.connect(owner).revokeAccess(1, stranger.address),
      ).to.be.revertedWithCustomError(registry, "AccessNotGranted");
    });
  });

  // ── hasAccess ───────────────────────────────────────────────────────────────

  describe("hasAccess", () => {
    beforeEach(async () => {
      await registry.connect(owner).registerRecord(SAMPLE_HASH, owner.address);
    });

    it("owner always has implicit access", async () => {
      expect(await registry.hasAccess(1, owner.address)).to.be.true;
    });

    it("stranger has no access", async () => {
      expect(await registry.hasAccess(1, stranger.address)).to.be.false;
    });
  });

  // ── deactivateRecord ────────────────────────────────────────────────────────

  describe("deactivateRecord", () => {
    beforeEach(async () => {
      await registry.connect(owner).registerRecord(SAMPLE_HASH, owner.address);
    });

    it("deactivates the record and emits RecordDeactivated", async () => {
      const tx = await registry.connect(owner).deactivateRecord(1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      const ts = BigInt(block!.timestamp);
      await expect(tx)
        .to.emit(registry, "RecordDeactivated")
        .withArgs(1n, owner.address, ts);
      const [, , , , active] = await registry.getRecord(1);
      expect(active).to.be.false;
    });

    it("preserves the hash after deactivation", async () => {
      await registry.connect(owner).deactivateRecord(1);
      const [hash] = await registry.getRecord(1);
      expect(hash).to.equal(SAMPLE_HASH);
    });

    it("reverts when called by non-owner", async () => {
      await expect(
        registry.connect(stranger).deactivateRecord(1),
      ).to.be.revertedWithCustomError(registry, "NotOwner");
    });

    it("reverts on repeated deactivation", async () => {
      await registry.connect(owner).deactivateRecord(1);
      await expect(
        registry.connect(owner).deactivateRecord(1),
      ).to.be.revertedWithCustomError(registry, "AlreadyDeactivated");
    });
  });

  // ── recordExists ────────────────────────────────────────────────────────────

  describe("recordExists", () => {
    it("returns false before registration", async () => {
      expect(await registry.recordExists(1)).to.be.false;
    });

    it("returns true after registration", async () => {
      await registry.connect(owner).registerRecord(SAMPLE_HASH, owner.address);
      expect(await registry.recordExists(1)).to.be.true;
    });
  });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function latestTimestamp(): Promise<bigint> {
  const block = await ethers.provider.getBlock("latest");
  return BigInt(block?.timestamp ?? 0);
}
