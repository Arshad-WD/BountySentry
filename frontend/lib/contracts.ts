import { Contract, type Signer } from "ethers";
import ReportRegistryABI from "@/abis/ReportRegistry.json";
import { ENV } from "@/config/env";

export function getReportRegistry(signer: Signer) {
  return new Contract(
    ENV.REGISTRY_ADDRESS,
    ReportRegistryABI.abi,
    signer
  );
}
