"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class MyWorkload extends WorkloadModuleBase {
  constructor() {
    super(); //to call the constructor of its parent class to access the parent's properties and methods
  }

  async initializeWorkloadModule(
    workerIndex,
    totalWorkers,
    roundIndex,
    roundArguments,
    sutAdapter,
    sutContext
  ) {
    await super.initializeWorkloadModule(
      workerIndex,
      totalWorkers,
      roundIndex,
      roundArguments,
      sutAdapter,
      sutContext
    );

    for (let i = 1; i <= this.roundArguments.assets; i++) {
      const assetName = `${i}`;
      console.log(`Worker ${this.workerIndex}: Creating asset ${assetName}`);

      // Use the correct contractFunction and contractArguments for creating assets
      const request = {
        contractId: "IoT-cc",
        contractFunction: "createAsset",
        invokerIdentity: "User1",
        contractArguments: [
          `{"asset": [{"@assetType":"project","project":"${assetName.toString()}"}]}`,
        ],
        readOnly: false,
      };

      await this.sutAdapter.sendRequests(request);
    }
  }

  async submitTransaction() {
    const randomId = Math.floor(Math.random() * this.roundArguments.assets + 1);
    const assetName = `${randomId}`;
    console.log(`Worker ${this.workerIndex}: Reading asset ${assetName}`);

    // Use the correct contractFunction and contractArguments for reading assets
    const readAssetRequest = {
      contractId: "IoT-cc",
      contractFunction: "readAsset",
      invokerIdentity: "User1",
      contractArguments: [
        `{"key": {"@assetType":"project","project":"${assetName}"}}`,
      ],
      readOnly: true,
    };

    await this.sutAdapter.sendRequests(readAssetRequest);
  }

  async cleanupWorkloadModule() {
    for (let i = 1; i <= this.roundArguments.assets; i++) {
      const assetName = `${i}`;
      console.log(`Worker ${this.workerIndex}: Deleting asset ${assetName}`);

      // Use the correct contractFunction and contractArguments for deleting assets
      const deleteAssetRequest = {
        contractId: "IoT-cc",
        contractFunction: "deleteAsset",
        invokerIdentity: "User1",
        contractArguments: [
          `{"key": {"@assetType":"project","project":"${assetName.toString()}"}}`,
        ],
        readOnly: false, // Update to false for deletion
      };

      await this.sutAdapter.sendRequests(deleteAssetRequest);
    }
  }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleBase}
 */
function createWorkloadModule() {
  return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
