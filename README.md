Caliper for IoT-CC Performance Benchmarking

npm install --only=prod @hyperledger/caliper-cli@0.5.0

npx caliper bind --caliper-bind-sut fabric:2.4

npx caliper launch manager --caliper-workspace ../caliper-benchmarks/ --caliper-networkconfig ../caliper-benchmarks/networks/fabric/test-network.yaml --caliper-benchconfig ../caliper-benchmarks/workload/config.yaml --caliper-flow-only-test

docker rm -vf $(docker ps -a -q)
docker system prune --all
