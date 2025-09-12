import { useEffect, useState } from "react";
import styles from "./InvoiceForm.module.css";
import loaderStyles from "../../styles/loader.module.css";
import { ADMIN_END_POINT, generateInvoiceNumber } from "../../utils/constants";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const InvoiceForm = ({ onSubmit }) => {
  const { clientId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    invoiceNumber: generateInvoiceNumber(),
    userName: "",
    position: "",
    companyName: "",
    address: "",
    includeVAT: true,
    items: [{ description: "", quantity: "", price: "" }],
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...formData.items];

    items[index][name] = value;
    setFormData((prevData) => ({ ...prevData, items }));
  };

  const addItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      items: [...prevData.items, { description: "", quantity: "", price: "" }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const items = formData.items.filter((_, i) => i !== index);
    setFormData((prevData) => ({ ...prevData, items }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const invalidItem = formData.items.find(
      (item) => item.quantity <= 0 || item.price <= 0
    );
    if (invalidItem) {
      alert("All item quantities and prices must be greater than 0.");
      return;
    }

    const trimmedData = {
      ...formData,
      invoiceNumber: formData.invoiceNumber.trim(),
      userName: formData.userName.trim(),
      position: formData.position.trim(),
      companyName: formData.companyName.trim(),
      address: formData.address.trim(),
      items: formData.items.map((item) => ({
        ...item,
        description: item.description.trim(),
      })),
    };

    const hasEmptyDescription = trimmedData.items.some(
      (item) => item.description === ""
    );
    const hasEmptyName = trimmedData.userName === "";
    const hasEmptyPosition = trimmedData.position === "";
    const hasEmptyCompanyName = trimmedData.companyName === "";
    const hasEmptyAddress = trimmedData.address === "";

    if (hasEmptyName) {
      alert("Please enter a valid recipient name.");
      return;
    }
    if (hasEmptyPosition) {
      alert("Please enter a valid position.");
      return;
    }
    if (hasEmptyCompanyName) {
      alert("Please enter a valid company name.");
      return;
    }
    if (hasEmptyAddress) {
      alert("Please enter a valid company address.");
      return;
    }
    if (hasEmptyDescription) {
      alert("Please enter a valid description for all items.");
      return;
    }

    if (onSubmit) {
      onSubmit({ ...trimmedData, clientId });
    }
  };

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const res = await fetch(
          `${ADMIN_END_POINT}/generate-invoice/${clientId}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        const result = await res.json();

        if (!res.ok) {
          let errorData = result.error;
          toast.error(errorData || "Failed to fetch client details");
        }

        setData(result);

        // pre-fill formData with client + company info
        const { client, company } = result;
        setFormData((prev) => ({
          ...prev,
          userName: client.name || "",
          position: client.position || "",
          companyName: company.name || "",
          address:
            `${company.address.addressLine1}, ${company.address.addressLine2}, ${company.address.street}, ${company.address.landmark}, ${company.address.city}, ${company.address.state}, ${company.address.zipcode}, ${company.address.country}` ||
            "",
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  if (loading)
    return (
      <div className={loaderStyles.dotLoaderWrapper}>
        <div className={loaderStyles.dotLoader}></div>
      </div>
    );
  if (error) return <p className="error-text">{error}</p>;
  if (!data) return <p className="empty-text">No client details found</p>;

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <h1 className={styles.mainTitle}>Create New Invoice</h1>

        <div className={styles.detailsGrid}>
          <div>
            <h3 className={styles.sectionTitle}>Invoice Details</h3>
            <div className={styles.inputGroup}>
              <div>
                <label htmlFor="invoiceNumber" className={styles.inputLabel}>
                  Invoice Number
                </label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  readOnly
                  className={styles.inputField}
                />
              </div>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="includeVAT"
                  name="includeVAT"
                  checked={formData.includeVAT}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="includeVAT" className={styles.checkboxLabel}>
                  Include VAT (5%)
                </label>
              </div>
            </div>
          </div>
          <div>
            <h3 className={styles.sectionTitle}>Billed To</h3>
            <div className={styles.inputGroup}>
              <div>
                <label htmlFor="userName" className={styles.inputLabel}>
                  Recipient Name
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  title="Please enter a valid name (letters, spaces, periods only)"
                  onChange={handleInputChange}
                  className={styles.inputField}
                  placeholder="Kerry p. reuter"
                  maxLength={30}
                  readOnly
                  required
                />
              </div>
              <div>
                <label htmlFor="position" className={styles.inputLabel}>
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  title="Please enter a valid position (letters, spaces, hyphens, and periods only)"
                  maxLength={40}
                  onChange={handleInputChange}
                  className={styles.inputField}
                  placeholder="CEO of Happy Monster"
                  readOnly
                  required
                />
              </div>
              <div>
                <label htmlFor="companyName" className={styles.inputLabel}>
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  maxLength={30}
                  value={formData.companyName}
                  title="Please enter a valid company name (letters, spaces, hyphens, and periods only)"
                  onChange={handleInputChange}
                  className={styles.inputField}
                  placeholder="Happy Monster, UK"
                  readOnly
                  required
                />
              </div>
              <div>
                <label htmlFor="address" className={styles.inputLabel}>
                  Company Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  maxLength={80}
                  onChange={handleInputChange}
                  className={styles.inputField}
                  placeholder="303 Ashton Lane Austin, TX 78701"
                  readOnly
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.divider}>
          <h3 className={styles.sectionTitle}>Items</h3>
          <div className={styles.itemsList}>
            {formData.items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <div className={styles.itemDesc}>
                  <label className={styles.itemInputLabel}>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={item.description}
                    pattern="^[a-zA-Z0-9\s.,\-'/()]+$"
                    title="Please enter a valid description (letters, numbers, spaces, and basic punctuation only)"
                    onChange={(e) => handleItemChange(index, e)}
                    className={styles.itemInputField}
                    required
                  />
                </div>
                <div className={styles.itemQty}>
                  <label className={styles.itemInputLabel}>Qty</label>
                  <input
                    type="text"
                    name="quantity"
                    pattern="^\d+$"
                    title="Please enter a valid quantity (whole number)"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    className={styles.itemInputField}
                    required
                  />
                </div>
                <div className={styles.itemPrice}>
                  <label className={styles.itemInputLabel}>
                    Unit Price (AED)
                  </label>
                  <input
                    type="text"
                    name="price"
                    pattern="^\d+(\.\d{1,2})?$"
                    title="Please enter a valid price (e.g., 100.00)"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, e)}
                    className={styles.itemInputField}
                    required
                  />
                </div>
                <div className={styles.itemRemove}>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className={`${styles.button} ${styles.removeButton}`}
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className={`${styles.button} ${styles.addButton}`}
          >
            + Add Item
          </button>
        </div>

        <div className={styles.submitButtonContainer}>
          <button type="submit" className={styles.submitButton}>
            Generate Invoice
          </button>
        </div>
      </form>

      <button
        className={styles.backButton}
        onClick={() => window.history.back()}
      >
        Back
        <div className={styles.icon}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>
      </button>
    </>
  );
};

export default InvoiceForm;
