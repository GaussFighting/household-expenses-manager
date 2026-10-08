import useFetchPaymentTypes from "../hooks/useFetchPaymentTypes";

const PaymentTypes = () => {
  useFetchPaymentTypes();
  return <div>Payment Types</div>;
};

export default PaymentTypes;
