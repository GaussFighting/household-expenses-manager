import { useEffect } from "react";
import { getPaymentTypes } from "../services/api";

const useFetchPaymentTypes = () => {
  useEffect(() => {
    async function fetchPaymentTypes() {
      try {
        const data = await getPaymentTypes();
        console.log("Payment types", data);
      } catch (error) {
        console.error("Failed to fetch payment types", error);
      }
    }
    fetchPaymentTypes();
  }, []);
};

export default useFetchPaymentTypes;
