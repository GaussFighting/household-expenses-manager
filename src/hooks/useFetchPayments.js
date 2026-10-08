import { useEffect } from "react";
import { getPayments } from "../services/api";

const useFetchPayments = () => {
  useEffect(() => {
    async function fetchPayments() {
      try {
        const data = await getPayments();
        console.log("Payments", data);
      } catch (error) {
        console.error("Failed to fetch payments", error);
      }
    }
    fetchPayments();
  }, []);
};

export default useFetchPayments;
