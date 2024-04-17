"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");

class MyWorkload extends WorkloadModuleBase {
  async submitTransaction() {
    const randomId = Math.floor(Math.random() * this.roundArguments.assets + 1);
    const assetName = `Powerplant ${randomId}`;
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
}

function createWorkloadModule() {
  return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
