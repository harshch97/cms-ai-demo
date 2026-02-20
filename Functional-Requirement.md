

Here is your cleaned Functional Requirement document with all external references removed and formatted properly:

---

# Customer Management System – Functional Requirements

## 1. Functional Requirements  

### 1.1 Customer CRUD Operations  

The system must support basic CRUD operations (Create, Read, Update, Delete) for customer records.

- **Create:** Add a new customer profile.  
- **Read:** Retrieve and display customer details by ID or search criteria.  
- **Update:** Modify existing customer information.  
- **Delete:** Remove a customer record from the system.  

---

### 1.2 Customer Data Fields  

Each customer record shall include the following mandatory fields:

- **Full Name:** String (Alpha-only recommended).  
- **Company Name:** String.  
- **Phone Number:** String (Numeric with standard validation).  
- **Email ID:** String (Must follow standard email format validation).  

---

## 2. Address Management Requirements  

### 2.1 Multi-Address Support  

- The system shall support a **one-to-many relationship**, allowing each customer to have multiple addresses.  
- Users must be able to add, edit, or remove specific addresses from a customer's profile.  

---

### 2.2 Address Data Format  

Each address entry must contain the following fields:

- **House/Flat Number:** String / Alphanumeric.  
- **Building/Street Name:** String.  
- **Locality/Area:** String.  
- **City:** Selection from a predefined dropdown list.  
- **State:** Selection from a predefined dropdown list.  
- **PIN Code:** 6-digit numeric field with strictly enforced validation.  

---

## 3. Data Integrity & Constraints  

- **Unique Identifier:** Each customer must be assigned a unique ID for accurate retrieval.  
- **Validation:** The system shall validate that mandatory fields (e.g., Email, PIN Code) are correctly formatted before saving.  
- **Cascading Delete (Optional Policy):** If a customer is deleted, all associated addresses should also be removed.  

---