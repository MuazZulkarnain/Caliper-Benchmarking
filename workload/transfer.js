"use strict";

const { WorkloadModuleBase } = require("@hyperledger/caliper-core");
const axios = require("axios");

async function searchProjects() {
  const url = "http://localhost/api/query/search";
  const requestData = {
    query: {
      selector: {
        "@assetType": "project",
      },
    },
  };

  try {
    const response = await axios.post(url, requestData);
    const keysArray = response.data.result.map((project) => project["@key"]);
    return keysArray;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}

class MyWorkload extends WorkloadModuleBase {
  constructor() {
    super();
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
          `{"asset": [{"@assetType":"project","project":"${assetName}","amount":10000}]}`,
        ],
        readOnly: false,
      };

      await this.sutAdapter.sendRequests(request);
    }
  }

  async submitTransaction() {
    const keysArray = await searchProjects();
    // console.log("Keys Array:", keysArray);

    try {
      const randomIdFrom = Math.floor(
        Math.random() * this.roundArguments.assets
      );
      while (randomIdTo === randomIdFrom) {
        randomIdTo = Math.floor(Math.random() * this.roundArguments.assets);
      }
      const assetNameFrom = `${randomIdFrom}`;
      const assetNameTo = `${randomIdTo}`;
      const assetKeyFrom = `${keysArray[randomIdFrom]}`;
      const assetKeyTo = `${keysArray[randomIdTo]}`;
      const amount = Math.floor(Math.random() * 100);
      // Check if assetKey is defined before proceeding
      if (assetKeyFrom !== undefined || assetKeyTo !== undefined) {
        console.log(
          `Worker ${this.workerIndex}: Transferring ${amount} Carbon Credit from ${assetNameFrom} to ${assetNameTo} `
        );
        // Use the correct contractFunction and contractArguments for tokenizing assets
        const transferRequest = {
          contractId: "IoT-cc",
          contractFunction: "transferCarbonCredit",
          invokerIdentity: "User1",
          contractArguments: [
            `{"fromProject": {"@assetType":"project","@key":"${assetKeyFrom}"},"toProject":{"@assetType":"project","@key":"${assetKeyTo}"},"amount":${amount}}`,
          ],
          readOnly: false,
        };
        await this.sutAdapter.sendRequests(transferRequest);
      } else {
        console.log(`Asset key for ${assetName} is undefined.`);
        console.log(assetKey);
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  }

  async cleanupWorkloadModule() {
    try {
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
    } catch (error) {
      console.error("Error cleaning up workload module:", error);
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
