import useFetchPayments from "../hooks/useFetchPayments";

const Payments = () => {
  useFetchPayments();
  return <div>Payments</div>;
};

export default Payments;
