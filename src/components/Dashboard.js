import { useEffect, useState } from "react";
import {
  getPayments,
  getPaymentTypes,
  createPayment,
  updatePayment,
  deletePayment,
} from "../services/api";

const emptyForm = {
  dueDate: "",
  flatName: "",
  notes: "",
  paymentType: "",
  value: "",
};

const Dashboard = () => {
  const [payments, setPayments] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [paymentsData, paymentTypesData] = await Promise.all([
          getPayments(),
          getPaymentTypes(),
        ]);

        setPayments(paymentsData || []);
        setPaymentTypes(paymentTypesData || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);

    setForm({
      dueDate: payment.dueDate || "",
      flatName: payment.flatName || "",
      notes: payment.notes || "",
      paymentType: payment.paymentType || "",
      value: payment.value || "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingPayment) {
        const updatedPayment = await updatePayment(editingPayment.uuid, form);

        setPayments((prev) =>
          prev.map((payment) =>
            payment.uuid === editingPayment.uuid ? updatedPayment : payment,
          ),
        );
      } else {
        const newPayment = await createPayment(form);

        setPayments((prev) => [...prev, newPayment]);
      }

      setForm(emptyForm);
      setEditingPayment(null);

      setShowForm(false);
    } catch (error) {
      console.error("Failed to save payment", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (payment) => {
    try {
      setError("");

      await deletePayment(payment.uuid);

      setPayments((prev) => prev.filter((item) => item.uuid !== payment.uuid));
    } catch (error) {
      console.error("Failed to delete payment", error);
      setError(error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPayment(null);
    setForm(emptyForm);
  };

  const getPaymentTypeName = (paymentTypeUuid) => {
    const paymentType = paymentTypes.find(
      (type) => type.uuid === paymentTypeUuid,
    );

    return paymentType?.name || paymentTypeUuid;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && payments.length) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <div className="error-icon">!</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <button className="button button-primary" onClick={handleAddPayment}>
        Add expense
      </button>

      {showForm && (
        <section className="payment-form-section">
          <h2>{editingPayment ? "Edit expense" : "Add expense"}</h2>

          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="dueDate">Due date</label>

              <input
                id="dueDate"
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="flatName">Flat name</label>

              <input
                id="flatName"
                name="flatName"
                value={form.flatName}
                onChange={handleInputChange}
                placeholder="Flat name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentType">Payment type</label>

              <select
                id="paymentType"
                name="paymentType"
                value={form.paymentType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select payment type</option>

                {paymentTypes.map((paymentType) => (
                  <option key={paymentType.uuid} value={paymentType.uuid}>
                    {paymentType.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="value">Value</label>

              <input
                id="value"
                type="number"
                step="0.01"
                name="value"
                value={form.value}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="notes">Notes</label>

              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                placeholder="Additional notes"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : editingPayment ? "Update" : "Save"}
              </button>

              <button
                type="button"
                className="button button-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="dashboard-section">
        <h2>Payments</h2>

        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Due date</th>
                <th>Flat name</th>
                <th>Notes</th>
                <th>Payment type</th>
                <th className="value-column">Value</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.uuid}>
                  <td>{formatDate(payment.dueDate)}</td>
                  <td className="bold-cell">{payment.flatName}</td>
                  <td className="notes-cell">{payment.notes || "—"}</td>
                  <td>{getPaymentTypeName(payment.paymentType)}</td>
                  <td className="value-cell">{payment.value}</td>
                  <td>
                    <button
                      className="button button-secondary"
                      onClick={() => handleEditPayment(payment)}
                    >
                      Edit
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={() => handleDeletePayment(payment)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Payment types</h2>

        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Payment name</th>
                <th>Image</th>
              </tr>
            </thead>

            <tbody>
              {paymentTypes.map((paymentType) => (
                <tr key={paymentType.uuid}>
                  <td className="bold-cell">{paymentType.name}</td>
                  <td>{paymentType.image}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
