import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getAllEmployees } from "../services/employeeService";
import {
  addDevice,
  updateDevice,
  deleteDevice,
  getAllDevices,
  addMultipleDevices,
  getNextDevId,
} from "../services/deviceService";
import { logDeviceHistory } from "../services/deviceHistoryService";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

const initialForm = {
  deviceType: "",
  deviceTag: "",
  brand: "",
  model: "",
  status: "",
  condition: "",
  remarks: "",
  acquisitionDate: "", // Added acquisitionDate
};

const fieldLabels = {
  deviceType: "Device Type",
  deviceTag: "Device Tag",
  brand: "Brand",
  model: "Model",
  status: "Status",
  condition: "Condition",
  remarks: "Remarks",
  acquisitionDate: "Acquisition Date", // Added label
};

const deviceTypes = [
  { label: "Headset", code: "HS" },
  { label: "Keyboard", code: "KB" },
  { label: "Laptop", code: "LPT" },
  { label: "Monitor", code: "MN" },
  { label: "Mouse", code: "M" },
  { label: "PC", code: "PC" },
  { label: "PSU", code: "PSU" },
  { label: "RAM", code: "RAM" },
  { label: "SSD", code: "SSD" },
  { label: "UPS", code: "UPS" },
  { label: "Webcam", code: "W" },
];

const statuses = ["Available", "In Use", "Stock Room", "Retired"];
const conditions = ["New", "Working", "Needs Repair", "Retired"];

function DeviceFormModal({
  data,
  onChange,
  onSave,
  onCancel,
  onGenerateTag,
  employees,
  tagError,
  saveError,
  isValid,
  useSerial,
  setUseSerial,
  setTagError,
  onSerialToggle,
  editingDevice,
}) {
  const handleSerialToggle = (e) => {
    const checked = e.target.checked;
    onSerialToggle(checked);
  };

  const isEditMode = Boolean(editingDevice);

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.inventoryModalContent}>
        <h3 style={styles.inventoryModalTitle}>{data.id ? "Edit Device" : "Add Device"}</h3>
        
        {/* Row 1: Device Type and Brand */}
        <div style={{ display: "flex", gap: 16, width: "100%", marginBottom: 12 }}>
          <div style={{ ...styles.inventoryInputGroup, flex: 1, marginBottom: 0 }}>
            <label style={styles.inventoryLabel}>Device Type:</label>
            <select
              name="deviceType"
              value={data.deviceType}
              onChange={onChange}
              style={styles.inventoryInput}
            >
              <option value="">Select Device Type</option>
              {deviceTypes.map((type) => (
                <option key={type.label} value={type.label}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ ...styles.inventoryInputGroup, flex: 1, marginBottom: 0 }}>
            <label style={styles.inventoryLabel}>Brand:</label>
            <input
              name="brand"
              value={data.brand}
              onChange={onChange}
              style={styles.inventoryInput}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Row 2: Device Tag (full width when visible) */}
        {data.deviceType && (
          <div style={{ ...styles.inventoryInputGroup, marginBottom: 12 }}>
            <label style={styles.inventoryLabel}>Device Tag:</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center", width: "100%" }}>
              {!useSerial ? (
                <>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#2563eb", minWidth: "fit-content" }}>{`JOII${
                    deviceTypes.find((t) => t.label === data.deviceType)?.code ||
                    ""
                  }`}</span>
                  <input
                    name="deviceTagDigits"
                    value={data.deviceTag.replace(
                      `JOII${
                        deviceTypes.find((t) => t.label === data.deviceType)
                          ?.code || ""
                      }`,
                      ""
                    )}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      onChange({
                        target: {
                          name: "deviceTag",
                          value: `JOII${
                            deviceTypes.find((t) => t.label === data.deviceType)
                              ?.code || ""
                          }${val}`,
                        },
                      });
                    }}
                    style={{ width: 70, padding: "8px 12px", borderRadius: 6, border: '1.5px solid #cbd5e1', background: '#f1f5f9', fontSize: 14, height: "36px", boxSizing: "border-box" }}
                    maxLength={4}
                    pattern="\\d{0,4}"
                    placeholder="0001"
                  />
                  <button type="button" onClick={onGenerateTag} style={{
                    ...styles.inventoryModalButtonSmall,
                    padding: "6px 12px",
                    fontSize: 13
                  }}>
                    Generate
                  </button>
                </>
              ) : (
                <input
                  key={useSerial ? "serial" : "tag"}
                  name="deviceTag"
                  value={data.deviceTag}
                  onChange={onChange}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: '1.5px solid #cbd5e1', background: '#f1f5f9', fontSize: 14, height: "36px", boxSizing: "border-box" }}
                  maxLength={64}
                  placeholder="Enter Serial Number"
                />
              )}
            </div>
            <label style={{ marginTop: 8, display: "flex", alignItems: "center", fontWeight: 400, fontSize: 13, color: "#222e3a" }}>
              <input
                type="checkbox"
                checked={useSerial}
                onChange={handleSerialToggle}
                style={{ marginRight: 6, accentColor: "#2563eb" }}
              />
              Use Serial Number Instead
            </label>
            {tagError && (
              <span style={{ color: "#e57373", fontSize: 12, marginTop: 4, display: "block" }}>{tagError}</span>
            )}
            {saveError && (
              <span style={{ color: "#e57373", fontSize: 12, marginTop: 4, display: "block" }}>{saveError}</span>
            )}
          </div>
        )}

        {/* Row 3: Model and Condition */}
        <div style={{ display: "flex", gap: 16, width: "100%", marginBottom: 12 }}>
          <div style={{ ...styles.inventoryInputGroup, flex: 1, marginBottom: 0 }}>
            <label style={styles.inventoryLabel}>Model:</label>
            <input
              name="model"
              value={data.model}
              onChange={onChange}
              style={styles.inventoryInput}
            />
          </div>
          
          <div style={{ ...styles.inventoryInputGroup, flex: 1, marginBottom: 0 }}>
            <label style={styles.inventoryLabel}>Condition:</label>
            <select
              name="condition"
              value={data.condition}
              onChange={onChange}
              style={styles.inventoryInput}
            >
              <option value="">Select Condition</option>
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Remarks only (removed Assigned To and Assignment Date) */}
        <div style={{ ...styles.inventoryInputGroup, marginBottom: 12 }}>
          <label style={styles.inventoryLabel}>Remarks:</label>
          <input
            name="remarks"
            value={data.remarks}
            onChange={onChange}
            style={styles.inventoryInput}
          />
        </div>
        <div style={{ ...styles.inventoryInputGroup, marginBottom: 12 }}>
          <label style={styles.inventoryLabel}>Acquisition Date:</label>
          <input
            name="acquisitionDate"
            type="date"
            value={data.acquisitionDate || ""}
            onChange={onChange}
            style={styles.inventoryInput}
          />
        </div>

        {/* Buttons */}
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 10, width: "100%" }}>
          <button onClick={onSave} disabled={!isValid} style={{
            ...styles.inventoryModalButton,
            opacity: isValid ? 1 : 0.6,
            cursor: isValid ? "pointer" : "not-allowed",
            padding: "10px 24px",
            fontSize: 14
          }}>
            Save
          </button>
          <button onClick={onCancel} style={{
            ...styles.inventoryModalButtonSecondary,
            padding: "10px 24px",
            fontSize: 14
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Inventory() {

  // Add this function inside your Inventory component, before the return statement:
const handleTempDeployDone = async () => {
  if (!selectedAssignEmployee || !assigningDevice) return;
  try {
    // Generate docx for temporary deploy
    const response = await fetch(
      "/src/AccountabilityForms/ASSET ACCOUNTABILITY FORM - NEW ISSUE.docx"
    );
    const content = await response.arrayBuffer();
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    const emp = employees.find((e) => e.id === selectedAssignEmployee.id);
    // Philippine date logic
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const phTime = new Date(utc + 8 * 60 * 60000); // GMT+8
    const assignmentDate = phTime.getFullYear() + '-' +
      String(phTime.getMonth() + 1).padStart(2, '0') + '-' +
      String(phTime.getDate()).padStart(2, '0');
    doc.setData({
      name: emp?.fullName || "",
      dateHired: emp?.dateHired || "",
      department: emp?.department || emp?.client || "",
      position: emp?.position || "",
      devices: [{
        assignmentDate: (() => {
          let dateToFormat = assigningDevice.assignmentDate || assignmentDate;
          let formattedDate = "";
          if (dateToFormat) {
            const dateObj = new Date(dateToFormat);
            if (!isNaN(dateObj)) {
              formattedDate = dateObj.toLocaleString('en-US', {
                year: 'numeric', month: 'long', day: '2-digit'
              });
            } else {
              formattedDate = dateToFormat;
            }
          }
          return formattedDate;
        })(),
        deviceType: assigningDevice.deviceType,
        brand: assigningDevice.brand,
        deviceTag: assigningDevice.deviceTag,
        condition: assigningDevice.condition,
        remarks: "temporary deployed",
      }],
      newIssueNewBoxRed: "",
      newIssueNewBoxBlack: "☐",
      newIssueStockBoxRed: "",
      newIssueStockBoxBlack: "☐",
      wfhNewBoxRed: "",
      wfhNewBoxBlack: "☐",
      wfhStockBoxRed: "",
      wfhStockBoxBlack: "☐",
    });
    doc.render();
    const out = doc.getZip().generate({ type: "blob" });
    const employeeName = emp?.fullName ? emp.fullName.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_") : "Employee";
    const fileName = `${employeeName} - TEMPORARY DEPLOY.docx`;
    saveAs(out, fileName);
    await updateDevice(assigningDevice.id, {
      ...assigningDevice,
      assignedTo: selectedAssignEmployee.id,
      assignmentDate: new Date().toISOString().slice(0, 10),
      status: "In Use",
    });
    await logDeviceHistory({
      employeeId: selectedAssignEmployee.id,
      deviceId: assigningDevice.id,
      deviceTag: assigningDevice.deviceTag,
      action: "assigned (temporary)",
      date: new Date().toISOString(),
    });
    closeAssignModal();
    loadDevicesAndEmployees();
  } catch (err) {
    alert("Failed to assign device or generate document. Please try again.");
  }
};


  // --- STATE ---
  const [devices, setDevices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...initialForm });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagError, setTagError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [useSerial, setUseSerial] = useState(false);
  const [assigningDevice, setAssigningDevice] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });
  // Add search state
  const [deviceSearch, setDeviceSearch] = useState("");

  // Assign modal state
  const [assignStep, setAssignStep] = useState(0);
  const [selectedAssignEmployee, setSelectedAssignEmployee] = useState(null);
  const [issueChecks, setIssueChecks] = useState({
    newIssueNew: false,
    newIssueStock: false,
    wfhNew: false,
    wfhStock: false,
  });
  const [showGenerateBtn, setShowGenerateBtn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [docxBlob, setDocxBlob] = useState(null);

  // --- STATE for New Acquisitions Modal ---
const [showNewAcqModal, setShowNewAcqModal] = useState(false);
const [newAcqForm, setNewAcqForm] = useState({
  deviceType: "",
  brand: "",
  model: "",
  condition: "",
  remarks: "",
  acquisitionDate: "",
  startTag: "",
  endTag: "",
  supplier: "", // Added supplier field for modal only
});
const [newAcqError, setNewAcqError] = useState("");
const [newAcqLoading, setNewAcqLoading] = useState(false);
const [assignSerialManually, setAssignSerialManually] = useState(false);
const [manualQuantity, setManualQuantity] = useState(1);
const [showManualSerialPanel, setShowManualSerialPanel] = useState(false);
const [manualSerials, setManualSerials] = useState([]);

  // --- HANDLERS ---
  const getStatus = (assignedTo) => (assignedTo ? "In Use" : "Stock Room");

  const handleInput = ({ target: { name, value, type } }) => {
    if (name === "deviceType") {
      setForm((prev) => ({ ...prev, deviceType: value, deviceTag: "" }));
      setTagError("");
      return;
    }
    if (name === "deviceTag") {
      if (useSerial) {
        setTagError("");
        setForm((prev) => ({ ...prev, [name]: value }));
        return;
      }
      const typeObj = deviceTypes.find((t) => t.label === form.deviceType);
      if (typeObj) {
        const prefix = `JOII${typeObj.code}`;
        const regex = new RegExp(`^${prefix}\\d{0,4}$`);
        if (!regex.test(value)) {
          setTagError(
            `Device tag must be in the format ${prefix}0001 (4 digits, no letters).`
          );
          return;
        }
      }
      setTagError("");
    }
    if (name === "assignedTo") {
      setForm((prev) => {
        let newCondition = prev.condition;
        if (value && (prev.condition === "New" || !prev.condition)) {
          newCondition = "Working";
        }
        return {
          ...prev,
          assignedTo: value,
          condition: newCondition,
        };
      });
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateTag = async () => {
    const typeObj = deviceTypes.find((t) => t.label === form.deviceType);
    if (!typeObj) return;
    const prefix = `JOII${typeObj.code}`;
    const allDevices = await getAllDevices();
    const ids = allDevices
      .map((d) => d.deviceTag)
      .filter((tag) => tag && tag.startsWith(prefix))
      .map((tag) => parseInt(tag.replace(prefix, "")))
      .filter((num) => !isNaN(num));
    const max = ids.length > 0 ? Math.max(...ids) : 0;
    const newTag = `${prefix}${String(max + 1).padStart(4, "0")}`;
    setForm((prev) => ({ ...prev, deviceTag: newTag }));
  };

  useEffect(() => {
    loadDevicesAndEmployees();
  }, []);

  const loadDevicesAndEmployees = async () => {
    setLoading(true);
    const [deviceData, employeeData] = await Promise.all([
      getAllDevices(),
      getAllEmployees(),
    ]);
    setDevices(deviceData);
    setEmployees(employeeData);
    setLoading(false);
  };

  const isFormValid = () =>
    form.deviceType.trim() !== "" &&
    form.deviceTag.trim() !== "" &&
    form.brand.trim() !== "" &&
    form.condition.trim() !== "" &&
    !tagError;

  const handleSave = async () => {
    setSaveError("");
    if (!isFormValid()) {
      setSaveError("Please fill in all required fields.");
      return;
    }
    const allDevices = await getAllDevices();
    if (useSerial) {
      const serialExists = allDevices.some(
        (d) =>
          d.deviceTag &&
          d.deviceTag.toLowerCase() === form.deviceTag.toLowerCase() &&
          (!form._editDeviceId || d.id !== form._editDeviceId)
      );
      if (serialExists) {
        setSaveError(
          "Serial number already exists. Please use a unique serial number."
        );
        return;
      }
    } else {
      const isDuplicate = allDevices.some(
        (d) =>
          d.deviceTag === form.deviceTag &&
          (!form._editDeviceId || d.id !== form._editDeviceId)
      );
      if (isDuplicate) {
        setSaveError("Device tag already exists. Please use a unique tag.");
        return;
      }
    }
    const typeObj = deviceTypes.find((t) => t.label === form.deviceType);
    if (!typeObj) {
      setSaveError("Invalid device type.");
      return;
    }
    const tagPrefix = `JOII${typeObj.code}`;
    const payload = {
      ...form,
      status: "Stock Room",
      condition: form.condition || "New",
      acquisitionDate: form.acquisitionDate || "",
    };
    if (useSerial) {
      if (!form._editDeviceId) {
        await addDevice(payload);
      } else {
        await updateDevice(form._editDeviceId, payload);
      }
    } else {
      if (!form._editDeviceId) {
        await addDevice(payload, tagPrefix);
      } else {
        await updateDevice(form._editDeviceId, payload);
      }
    }
    resetForm();
    loadDevicesAndEmployees();
  };

  const handleEdit = (device) => {
    const { id, ...rest } = device;
    setForm({ ...rest, _editDeviceId: id });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await deleteDevice(id);
    loadDevicesAndEmployees();
  };

  const resetForm = () => {
    setForm({ ...initialForm });
    setUseSerial(false);
    setShowForm(false);
  };

  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.fullName : id || "";
  };

  const handleSerialToggle = (checked) => {
    setUseSerial(checked);
    setForm((prev) => ({ ...prev, deviceTag: "" }));
    setTagError("");
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportProgress({ current: 0, total: 0 });
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      let rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      rows = rows.map((row) => {
        const cleaned = {};
        Object.keys(row).forEach((key) => {
          const cleanKey = key.replace(/['"]+/g, "").trim();
          cleaned[cleanKey] = row[key];
        });
        return cleaned;
      });
      const filteredRows = rows.filter(
        (row) =>
          row["Device Type"] ||
          row["Device Tag"] ||
          row["Brand"] ||
          row["Model"] ||
          row["Condition"] ||
          row["Remarks"]
      );
      setImportProgress({ current: 0, total: filteredRows.length });
      let importedCount = 0;
      // Fetch all devices for duplicate check
      const allDevices = await getAllDevices();
      for (let i = 0; i < filteredRows.length; i++) {
        const row = filteredRows[i];
        setImportProgress({ current: i + 1, total: filteredRows.length });
        if (
          row["Device Type"] &&
          row["Device Tag"] &&
          row["Brand"] &&
          row["Condition"]
        ) {
          // Convert Excel serial date to mm/dd/yyyy if needed
          let acquisitionDate = row["Acquisition Date"] || "";
          if (typeof acquisitionDate === "number") {
            const jsDate = new Date(Math.round((acquisitionDate - 25569) * 86400 * 1000));
            acquisitionDate =
              (jsDate.getMonth() + 1).toString().padStart(2, "0") +
              "/" +
              jsDate.getDate().toString().padStart(2, "0") +
              "/" +
              jsDate.getFullYear();
          } else if (typeof acquisitionDate === "string" && acquisitionDate) {
            // Try to parse and reformat if not already mm/dd/yyyy
            const d = new Date(acquisitionDate);
            if (!isNaN(d)) {
              acquisitionDate =
                (d.getMonth() + 1).toString().padStart(2, "0") +
                "/" +
                d.getDate().toString().padStart(2, "0") +
                "/" +
                d.getFullYear();
            }
          }
          // Check for duplicate deviceTag
          const existing = allDevices.find(
            (d) => d.deviceTag && d.deviceTag.toLowerCase() === row["Device Tag"].toLowerCase()
          );
          const devicePayload = {
            deviceType: row["Device Type"],
            deviceTag: row["Device Tag"],
            brand: row["Brand"],
            model: row["Model"] || "",
            condition: row["Condition"],
            remarks: row["Remarks"] || "",
            status: "Stock Room",
            assignedTo: "",
            assignmentDate: "",
            acquisitionDate,
          };
          try {
            if (existing) {
              await updateDevice(existing.id, devicePayload); // Overwrite
            } else {
              await addDevice(devicePayload);
            }
            importedCount++;
          } catch (err) {}
        }
      }
      await loadDevicesAndEmployees();
      alert(
        `Import finished! Imported ${importedCount} of ${filteredRows.length} row(s).`
      );
    } catch (err) {
      alert("Failed to import. Please check your Excel file format.");
    }
    setImporting(false);
    setImportProgress({ current: 0, total: 0 });
    e.target.value = "";
  };

  // --- FILTERED DEVICES ---
const filteredDevices = devices.filter(device => {
  const q = deviceSearch.toLowerCase();
  return (
    device.deviceType?.toLowerCase().includes(q) ||
    device.deviceTag?.toLowerCase().includes(q) ||
    device.brand?.toLowerCase().includes(q) ||
    device.model?.toLowerCase().includes(q) ||
    device.condition?.toLowerCase().includes(q) ||
    device.remarks?.toLowerCase().includes(q)
  );
});

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(filteredDevices.map((d) => d.id));
    } else {
      setSelectedIds(selectedIds.filter(id => !filteredDevices.some(d => d.id === id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (
      selectedIds.length === 0 ||
      !window.confirm(`Delete ${selectedIds.length} selected device(s)?`)
    )
      return;
    setDeleteProgress({ current: 0, total: selectedIds.length });
    for (let i = 0; i < selectedIds.length; i++) {
      await deleteDevice(selectedIds[i]);
      setDeleteProgress({ current: i + 1, total: selectedIds.length });
    }
    setSelectedIds([]);
    setSelectAll(false);
    setDeleteProgress({ current: 0, total: 0 });
    loadDevicesAndEmployees();
  };

  // --- ASSIGN MODAL LOGIC ---
  const [assignModalStep, setAssignModalStep] = useState(0);
  const [assignModalChecks, setAssignModalChecks] = useState({
    newIssueNew: false,
    newIssueStock: false,
    wfhNew: false,
    wfhStock: false,
    temporaryDeploy: false,
  });
  const [assignModalShowGenerate, setAssignModalShowGenerate] = useState(false);
  const [assignModalGenerating, setAssignModalGenerating] = useState(false);
  const [assignModalProgress, setAssignModalProgress] = useState(0);
  const [assignModalDocxBlob, setAssignModalDocxBlob] = useState(null);

  // Assign Modal Flow
  const openAssignModal = (device) => {
    setAssigningDevice(device);
    setAssignModalOpen(true);
    setAssignModalStep(1);
    setDocxBlob(null);
    setAssignSearch("");
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setAssigningDevice(null);
    setAssignModalStep(0);
    setSelectedAssignEmployee(null);
    setAssignModalChecks({
      newIssueNew: false,
      newIssueStock: false,
      wfhNew: false,
      wfhStock: false,
      temporaryDeploy: false,
    });
    setAssignModalShowGenerate(false);
    setProgress(0);
    setGenerating(false);
    setDocxBlob(null);
    setAssignSearch("");
  };

  const handleAssignModalCheckbox = (e) => {
    setAssignModalChecks((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  };

  const handleAssignModalNext = () => {
    setAssignModalShowGenerate(true);
  };

  const handleAssignModalGenerateDocx = async () => {
    setAssignModalGenerating(true);
    setAssignModalProgress(10);
    try {
      const response = await fetch(
        "/src/AccountabilityForms/ASSET ACCOUNTABILITY FORM - NEW ISSUE.docx"
      );
      setAssignModalProgress(20);
      const content = await response.arrayBuffer();
      setAssignModalProgress(30);
      const zip = new PizZip(content);
      setAssignModalProgress(40);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      setAssignModalProgress(50);

      const emp = employees.find((e) => e.id === selectedAssignEmployee.id);
      // Get all selected devices for assignment
      const selectedDeviceObjects = devices.filter(d => selectedIds.includes(d.id));
      // Philippine date logic
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const phTime = new Date(utc + 8 * 60 * 60000); // GMT+8
      const assignmentDate = phTime.getFullYear() + '-' +
        String(phTime.getMonth() + 1).padStart(2, '0') + '-' +
        String(phTime.getDate()).padStart(2, '0');

      doc.setData({
        name: emp?.fullName || "",
        dateHired: emp?.dateHired || "",
        department: emp?.department || emp?.client || "",
        position: emp?.position || "",
        devices: selectedDeviceObjects.map(dev => {
          // Format assignmentDate as 'June 06, 2025'
          let dateToFormat = dev.assignmentDate || assignmentDate;
          let formattedDate = "";
          if (dateToFormat) {
            const dateObj = new Date(dateToFormat);
            if (!isNaN(dateObj)) {
              formattedDate = dateObj.toLocaleString('en-US', {
                year: 'numeric', month: 'long', day: '2-digit'
              });
            } else {
              formattedDate = dateToFormat;
            }
          }
          return {
            assignmentDate: formattedDate,
            deviceType: dev.deviceType,
            brand: dev.brand,
            deviceTag: dev.deviceTag,
            condition: dev.condition,
            remarks: assignModalChecks.temporaryDeploy ? "temporary deployed" : dev.remarks,
          };
        }),
        // Dual placeholders for colored checkboxes
        newIssueNewBoxRed: assignModalChecks.newIssueNew ? "◼" : "",
        newIssueNewBoxBlack: assignModalChecks.newIssueNew ? "" : "☐",
        newIssueStockBoxRed: assignModalChecks.newIssueStock ? "◼" : "",
        newIssueStockBoxBlack: assignModalChecks.newIssueStock ? "" : "☐",
        wfhNewBoxRed: assignModalChecks.wfhNew ? "◼" : "",
        wfhNewBoxBlack: assignModalChecks.wfhNew ? "" : "☐",
        wfhStockBoxRed: assignModalChecks.wfhStock ? "◼" : "",
        wfhStockBoxBlack: assignModalChecks.wfhStock ? "" : "☐",
      });

      setAssignModalProgress(60);
      doc.render();
      setAssignModalProgress(70);
      const out = doc.getZip().generate({ type: "blob" });
      setAssignModalDocxBlob(out);
      setAssignModalProgress(100);
      setAssignModalGenerating(false);
    } catch (e) {
      setAssignModalGenerating(false);
      alert("Failed to generate document. Please check the template and data.");
    }
  };

  // Download and assign devices when user clicks Download DOCX
const handleDownloadAndAssign = async () => {
  if (!assignModalDocxBlob) return;
  const emp = employees.find((e) => e.id === selectedAssignEmployee.id);
  const employeeName = emp?.fullName ? emp.fullName.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_") : "Employee";
  const fileName = `${employeeName} - NEW ISSUE.docx`;
  saveAs(assignModalDocxBlob, fileName);
  // Move assigned devices to assets (update their assignedTo, assignmentDate, status, remarks)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const phTime = new Date(utc + 8 * 60 * 60000); // GMT+8
  const assignmentDate = phTime.getFullYear() + '-' +
    String(phTime.getMonth() + 1).padStart(2, '0') + '-' +
    String(phTime.getDate()).padStart(2, '0');
  for (const dev of devices.filter(d => selectedIds.includes(d.id))) {
    await updateDevice(dev.id, {
      ...dev,
      assignedTo: selectedAssignEmployee.id,
      assignmentDate,
      status: "In Use",
      remarks: assignModalChecks.temporaryDeploy ? "temporary deployed" : dev.remarks,
    });
    await logDeviceHistory({
      employeeId: selectedAssignEmployee.id,
      deviceId: dev.id,
      deviceTag: dev.deviceTag,
      action: "assigned",
      date: new Date().toISOString(),
    });
  }
  closeAssignModal();
  loadDevicesAndEmployees();
};

  // --- END ASSIGN MODAL LOGIC ---

  // Handler for bulk assign
const handleBulkAssign = () => {
  if (selectedIds.length === 0) return;
  // For now, open assign modal for the first selected device
  const device = devices.find((d) => d.id === selectedIds[0]);
  if (device) {
    openAssignModal(device);
  }
  // If you want to support multi-assign, you can extend this logic
};

  // --- New Acquisitions Functionality ---
const handleNewAcquisitions = async () => {
  // Prompt for device type, brand, model, condition, remarks, acquisition date, start tag, end tag
  // (In your UI, these are already collected by the modal, so here we just handle the logic)
  // Find the modal fields by their DOM selectors if needed, or use a ref-based approach if you want to trigger from a button
  // But since your modal is already present, just implement the logic for adding devices in bulk
  // This function is to be called by the New Acquisitions button

  // This is a placeholder for the actual modal logic, which should call this function with the correct data
  // For now, you can call this function from your modal's submit handler
};

// Attach to the button:
// <button style={styles.button} onClick={handleNewAcquisitions}>New Acquisitions</button>
// In your modal, call handleNewAcquisitions with the correct data

// The actual logic for adding devices in bulk:
const addDevicesInBulk = async ({ deviceType, brand, model, condition, remarks, acquisitionDate, startTag, endTag }) => {
  if (!deviceType || !brand || !condition || !startTag || !endTag) {
    throw new Error("Please fill in all required fields.");
  }
  const typeObj = deviceTypes.find((t) => t.label === deviceType);
  if (!typeObj) {
    throw new Error("Invalid device type.");
  }
  const prefix = `JOII${typeObj.code}`;
  const start = parseInt(startTag, 10);
  const end = parseInt(endTag, 10);
  if (isNaN(start) || isNaN(end) || start > end || start < 0 || end < 0 || (end - start + 1) > 100) {
    throw new Error("Invalid tag range (max 100 at a time, start <= end, numbers only).");
  }
  const allDevices = await getAllDevices();
  let added = 0;
  for (let i = start; i <= end; i++) {
    const tagNum = String(i).padStart(4, "0");
    const deviceTag = `${prefix}${tagNum}`;
    const existing = allDevices.find((d) => d.deviceTag === deviceTag);
    const payload = {
      deviceType,
      deviceTag,
      brand,
      model: model || "",
      condition,
      remarks: remarks || "",
      status: "Stock Room",
      assignedTo: "",
      assignmentDate: "",
      acquisitionDate: acquisitionDate || "",
    };
    try {
      if (existing) {
        await updateDevice(existing.id, payload);
      } else {
        await addDevice(payload);
      }
      added++;
    } catch (error) {
      console.error(`Failed to add/update device ${deviceTag}:`, error);
    }
  }
  await loadDevicesAndEmployees();
  return added;
};

  const handleNewAcqInput = ({ target: { name, value } }) => {
    setNewAcqForm((prev) => ({ ...prev, [name]: value }));
    setNewAcqError("");
  };

  const handleManualSerialToggle = (e) => {
    const checked = e.target.checked;
    setAssignSerialManually(checked);
    if (!checked) {
      setShowManualSerialPanel(false);
      setManualSerials([]);
    }
  };

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value) || 1;
    setManualQuantity(Math.max(1, Math.min(100, qty))); // Limit between 1-100
  };

  const handleProceedToManualEntry = () => {
    if (!newAcqForm.deviceType || !newAcqForm.brand || !newAcqForm.condition) {
      setNewAcqError("Please fill in Device Type, Brand, and Condition first.");
      return;
    }
    // Initialize serial inputs array
    const serialsArray = Array(manualQuantity).fill("").map((_, index) => ({
      id: index,
      serial: ""
    }));
    setManualSerials(serialsArray);
    setShowManualSerialPanel(true);
  };

  const handleManualSerialChange = (index, value) => {
    setManualSerials(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, serial: value } : item
      )
    );
  };

  const handleImportSerials = (importText) => {
    const lines = importText.split('\n').map(line => line.trim()).filter(line => line);
    setManualSerials(prev => {
      const updated = [...prev];
      lines.forEach((serial, index) => {
        if (index < updated.length) {
          updated[index] = { ...updated[index], serial };
        }
      });
      return updated;
    });
  };

  const handleManualSerialSubmit = async () => {
    setNewAcqError("");
    setNewAcqLoading(true);
    
    try {
      // Validate all serials are filled
      const emptySerials = manualSerials.filter(item => !item.serial.trim());
      if (emptySerials.length > 0) {
        setNewAcqError("Please fill in all serial numbers.");
        setNewAcqLoading(false);
        return;
      }

      // Check for duplicate serials in the input
      const serialValues = manualSerials.map(item => item.serial.trim());
      const duplicateSerials = serialValues.filter((serial, index) => serialValues.indexOf(serial) !== index);
      if (duplicateSerials.length > 0) {
        setNewAcqError("Duplicate serial numbers found. Please use unique serials.");
        setNewAcqLoading(false);
        return;
      }

      // Check against existing devices
      const allDevices = await getAllDevices();
      const existingSerials = serialValues.filter(serial => 
        allDevices.some(device => device.deviceTag && device.deviceTag.toLowerCase() === serial.toLowerCase())
      );
      
      if (existingSerials.length > 0) {
        setNewAcqError(`Serial numbers already exist: ${existingSerials.join(", ")}`);
        setNewAcqLoading(false);
        return;
      }

      // Add devices with manual serials
      let added = 0;
      for (const serialItem of manualSerials) {
        const payload = {
          deviceType: newAcqForm.deviceType,
          deviceTag: serialItem.serial.trim(),
          brand: newAcqForm.brand,
          model: newAcqForm.model || "",
          condition: newAcqForm.condition,
          remarks: newAcqForm.remarks || "",
          status: "Stock Room",
          assignedTo: "",
          assignmentDate: "",
          acquisitionDate: newAcqForm.acquisitionDate || "",
        };
        
        try {
          await addDevice(payload);
          added++;
        } catch (err) {
          console.error("Failed to add device:", err);
        }
      }

      await loadDevicesAndEmployees();
      
      // Generate document for manual serial devices
      try {
        const deviceList = manualSerials.map(serialItem => ({
          deviceTag: serialItem.serial.trim(),
          deviceType: newAcqForm.deviceType,
          brand: newAcqForm.brand,
          model: newAcqForm.model,
          condition: newAcqForm.condition,
          remarks: newAcqForm.remarks
        }));
        
        await generateAcquisitionDocument(deviceList, newAcqForm);
      } catch (docError) {
        console.error("Document generation failed:", docError);
        // Continue even if document generation fails
      }
      
      alert(`Added ${added} device(s) with manual serials.`);
      
      // Reset form
      setShowNewAcqModal(false);
      setNewAcqForm({ deviceType: "", brand: "", model: "", condition: "", remarks: "", acquisitionDate: "", startTag: "", endTag: "", supplier: "" });
      setAssignSerialManually(false);
      setShowManualSerialPanel(false);
      setManualSerials([]);
      setManualQuantity(1);
    } catch (err) {
      setNewAcqError("Failed to add devices. Please try again.");
    }
    setNewAcqLoading(false);
  };

  const handleNewAcqSubmit = async () => {
    if (assignSerialManually) {
      // If manual serial assignment, proceed to manual entry panel
      handleProceedToManualEntry();
      return;
    }

    // Regular bulk add workflow
    setNewAcqError("");
    setNewAcqLoading(true);
    setProgress(0);
    try {
      // Validate required fields
      if (!newAcqForm.deviceType || !newAcqForm.brand || !newAcqForm.condition || !newAcqForm.startTag || !newAcqForm.endTag) {
        setNewAcqError("Please fill in all required fields.");
        setNewAcqLoading(false);
        return;
      }

      setProgress(10);
      
      // Calculate device tags for document generation
      const startNum = parseInt(newAcqForm.startTag.replace(/\D/g, ''), 10);
      const endNum = parseInt(newAcqForm.endTag.replace(/\D/g, ''), 10);
      
      if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
        setNewAcqError("Invalid tag range. Please check start and end tags.");
        setNewAcqLoading(false);
        return;
      }

      const quantity = endNum - startNum + 1;
      setProgress(20);
      
      // Get device type prefix
      const typeObj = deviceTypes.find((t) => t.label === newAcqForm.deviceType);
      if (!typeObj) {
        setNewAcqError("Invalid device type.");
        setNewAcqLoading(false);
        return;
      }
      const prefix = `JOII${typeObj.code}`;
      
      // Generate device list for document
      const deviceList = [];
      for (let i = 0; i < quantity; i++) {
        const deviceTag = `${prefix}${String(startNum + i).padStart(4, '0')}`;
        deviceList.push({
          deviceTag,
          deviceType: newAcqForm.deviceType,
          brand: newAcqForm.brand,
          model: newAcqForm.model,
          condition: newAcqForm.condition,
          remarks: newAcqForm.remarks
        });
      }

      setProgress(40);

      // Add devices to database
      const addedCount = await addDevicesInBulk(newAcqForm);
      
      setProgress(70);
      
      // Generate document
      try {
        await generateAcquisitionDocument(deviceList, newAcqForm);
        setProgress(100);
        alert(`Successfully added ${addedCount} device(s) and generated acquisition document!`);
      } catch (docError) {
        console.error("Document generation failed:", docError);
        alert(`Successfully added ${addedCount} device(s), but document generation failed: ${docError.message}`);
      }
      
      setShowNewAcqModal(false);
      setNewAcqForm({ deviceType: "", brand: "", model: "", condition: "", remarks: "", acquisitionDate: "", startTag: "", endTag: "", supplier: "" });
      setAssignSerialManually(false);
      setShowManualSerialPanel(false);
      setManualSerials([]);
      setManualQuantity(1);
      setProgress(0);
    } catch (err) {
      setNewAcqError("Failed to add devices. Please try again.");
    }
    setNewAcqLoading(false);
  };

  // Generate New Asset Acquisition Record Form document with multiple tables
  const generateAcquisitionDocument = async (devices, acquisitionData) => {
    try {
      console.log("Starting document generation...", { devicesCount: devices.length, acquisitionData });
      
      // Load the template
      const templatePath = "/src/AccountabilityForms/NEW ASSET ACQUISITION RECORD FORM.docx";
      const response = await fetch(templatePath);
      
      if (!response.ok) {
        throw new Error("Template file not found. Please ensure NEW ASSET ACQUISITION RECORD FORM.docx is in /public/src/AccountabilityForms/");
      }
      
      console.log("Template loaded successfully");
      
      const arrayBuffer = await response.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error("Template file is empty or corrupted");
      }
      
      console.log("Template file size:", arrayBuffer.byteLength, "bytes");
      
      let zip, doc;
      try {
        zip = new PizZip(arrayBuffer);
        doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });
      } catch (zipError) {
        console.error("Error parsing template file:", zipError);
        throw new Error("Template file is not a valid DOCX file. Please ensure it's a proper Word document.");
      }

      // Configuration: rows per table (28 rows per page as requested)
      const ROWS_PER_TABLE = 28;

      // Prepare device data with common format
      const formattedDevices = devices.map(device => ({
        acquisitionDate: acquisitionData.acquisitionDate || new Date().toISOString().split('T')[0],
        supplier: acquisitionData.supplier || "Not specified",
        quantity: "1", // Each device is quantity 1
        deviceType: device.deviceType || acquisitionData.deviceType,
        brand: device.brand || acquisitionData.brand,
        deviceTag: device.deviceTag || device.serial,
        remarks: device.remarks || acquisitionData.remarks || ""
      }));

      console.log("Formatted devices:", formattedDevices.length);

      // Split devices across multiple tables (28 rows per page)
      const devicesPage1 = formattedDevices.slice(0, ROWS_PER_TABLE);
      const devicesPage2 = formattedDevices.slice(ROWS_PER_TABLE, ROWS_PER_TABLE * 2);
      const devicesPage3 = formattedDevices.slice(ROWS_PER_TABLE * 2, ROWS_PER_TABLE * 3);
      const devicesPage4 = formattedDevices.slice(ROWS_PER_TABLE * 3);

      // Prepare template data
      const templateData = {
        // Original single table (for backward compatibility)
        devices: formattedDevices,
        
        // Split tables
        devicesPage1: devicesPage1,
        devicesPage2: devicesPage2,
        devicesPage3: devicesPage3,
        devicesPage4: devicesPage4,
        
        // Metadata
        totalDevices: formattedDevices.length,
        acquisitionDate: acquisitionData.acquisitionDate || new Date().toISOString().split('T')[0],
        supplier: acquisitionData.supplier || "Not specified",
        
        // Page indicators (for conditional display)
        hasPage2: devicesPage2.length > 0,
        hasPage3: devicesPage3.length > 0,
        hasPage4: devicesPage4.length > 0,
        
        // Summary counts
        page1Count: devicesPage1.length,
        page2Count: devicesPage2.length,
        page3Count: devicesPage3.length,
        page4Count: devicesPage4.length
      };

      console.log('Template data structure:', {
        totalDevices: templateData.totalDevices,
        page1Count: templateData.page1Count,
        page2Count: templateData.page2Count,
        page3Count: templateData.page3Count,
        page4Count: templateData.page4Count
      });

      // Render the document
      try {
        doc.render(templateData);
        console.log("Document rendered successfully");
      } catch (renderError) {
        console.error("Error rendering template:", renderError);
        console.log("Template data being used:", templateData);
        
        // If rendering fails, provide helpful error message
        if (renderError.message.includes("tag")) {
          throw new Error("Template rendering failed. The DOCX template may be missing required placeholders. Please check the template structure.");
        } else {
          throw new Error(`Template rendering failed: ${renderError.message}`);
        }
      }

      // Generate and download
      const output = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `NEW_ASSET_ACQUISITION_RECORD_FORM-${currentDate}.docx`;
      
      console.log("Downloading document:", fileName);
      saveAs(output, fileName);
      
      return true;
    } catch (error) {
      console.error("Error generating document:", error);
      
      // Provide more specific error guidance
      if (error.message.includes("Template file not found")) {
        throw new Error("Template file not found. Please ensure 'NEW ASSET ACQUISITION RECORD FORM.docx' exists in the /public/src/AccountabilityForms/ folder.");
      } else if (error.message.includes("not a valid DOCX")) {
        throw new Error("The template file appears to be corrupted. Please replace it with a valid Word document (.docx file).");
      } else {
        throw error;
      }
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.headerBarGoogle}>
        <h2 style={styles.googleTitle}>Device Inventory</h2>
        <div style={styles.googleSearchBar}>
          <svg
            width="22"
            height="22"
            style={{ color: "#445F6D", opacity: 0.7 }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search devices..."
            value={deviceSearch}
            onChange={e => setDeviceSearch(e.target.value)}
            style={styles.googleSearchInput}
          />
        </div>
      </div>
      <div style={styles.buttonBar}>
        <button style={styles.button} onClick={() => setShowForm(true)}>
          Add Device
        </button>
        <label>
          <input
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleImportExcel}
            disabled={importing}
          />
          <button
            type="button"
            disabled={importing}
            style={styles.button}
            onClick={() =>
              document
                .querySelector('input[type="file"][accept=".xlsx,.xls"]')
                .click()
            }
          >
            {importing
              ? importProgress.total > 0
                ? `Importing ${importProgress.current}/${importProgress.total}...`
                : "Importing..."
              : "Import Excel"}
          </button>
        </label>
        <button
          style={{ ...styles.button, background: selectedIds.length ? styles.button.background : styles.buttonDisabled.background, color: selectedIds.length ? styles.button.color : styles.buttonDisabled.color }}
          disabled={selectedIds.length === 0}
          onClick={() => handleBulkAssign()}
        >
          Assign
        </button>
        <button
          style={{ ...styles.button, background: selectedIds.length ? '#e57373' : styles.buttonDisabled.background, color: selectedIds.length ? '#fff' : styles.buttonDisabled.color }}
          disabled={selectedIds.length === 0 || deleteProgress.total > 0}
          onClick={handleBulkDelete}
        >
          Delete
        </button>
        <button
          style={styles.button}
          onClick={() => setShowNewAcqModal(true)}
        >
          New Acquisitions
        </button>
        {deleteProgress.total > 0 && (
          <span style={styles.deletingText}>
            Deleting {deleteProgress.current}/{deleteProgress.total}...
          </span>
        )}
      </div>

      {showForm && (
        <DeviceFormModal
          data={form}
          onChange={handleInput}
          onSave={handleSave}
          onCancel={resetForm}
          onGenerateTag={handleGenerateTag}
          employees={employees}
          tagError={tagError}
          setTagError={setTagError}
          saveError={saveError}
          isValid={isFormValid()}
          useSerial={useSerial}
          setUseSerial={setUseSerial}
          onSerialToggle={handleSerialToggle}
          editingDevice={form._editDeviceId}
        />
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th
                  style={{
                    ...styles.th,
                    width: 32,
                    minWidth: 32,
                    maxWidth: 32,
                    textAlign: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      devices.length > 0 &&
                      selectedIds.length === devices.length
                    }
                    onChange={handleSelectAll}
                    style={{ width: 16, height: 16, margin: 0 }}
                  />
                </th>
                <th style={styles.th}>{fieldLabels.deviceType}</th>
                <th style={styles.th}>{fieldLabels.deviceTag}</th>
                <th style={styles.th}>{fieldLabels.brand}</th>
                <th style={styles.th}>{fieldLabels.model}</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>{fieldLabels.condition}</th>
                <th style={styles.th}>{fieldLabels.remarks}</th>
                <th style={styles.th}>{fieldLabels.acquisitionDate}</th>
                <th style={{
                  ...styles.th,
                  textAlign: "center",
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices
                .filter(device => {
                  const q = deviceSearch.toLowerCase();
                  return (
                    device.deviceType?.toLowerCase().includes(q) ||
                    device.deviceTag?.toLowerCase().includes(q) ||
                    device.brand?.toLowerCase().includes(q) ||
                    device.model?.toLowerCase().includes(q) ||
                    device.condition?.toLowerCase().includes(q) ||
                    device.remarks?.toLowerCase().includes(q)
                  );
                })
                .map((device) => (
                  <tr key={device.id}>
                    <td
                      style={{
                        ...styles.td,
                        width: 32,
                        minWidth: 32,
                        maxWidth: 32,
                        textAlign: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(device.id)}
                        onChange={() => handleSelectOne(device.id)}
                        style={{ width: 16, height: 16, margin: 0 }}
                      />
                    </td>
                    <td style={styles.td}>{device.deviceType}</td>
                    <td style={styles.td}>{device.deviceTag}</td>
                    <td style={styles.td}>{device.brand}</td>
                    <td style={styles.td}>{device.model}</td>
                    <td style={styles.td}>{device.status || "Stock Room"}</td>
                    <td style={styles.td}>{device.condition}</td>
                    <td style={styles.td}>{device.remarks}</td>
                    <td style={styles.td}>{device.acquisitionDate ? device.acquisitionDate : ""}</td>
                    <td style={{
                      ...styles.td,
                      textAlign: "center",
                    }}>
                      <div style={{ display: "flex", gap: 24, alignItems: "center", justifyContent: "center" }}>
                        <button
                          style={{
                            width: 48,
                            height: 48,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            outline: "none",
                            borderRadius: 12,
                            background: "#eaf7fa",
                            cursor: "pointer",
                            transition: "background 0.18s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#d0f0f7"}
                          onMouseLeave={e => e.currentTarget.style.background = "#eaf7fa"}
                          onClick={() => handleEdit(device)}
                          title="Edit"
                        >
      <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
      </svg>
                        </button>
                        <button
                          style={{
                            width: 48,
                            height: 48,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            outline: "none",
                            borderRadius: 12,
                            background: "#ffe9ec",
                            cursor: "pointer",
                            transition: "background 0.18s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#ffd6de"}
                          onMouseLeave={e => e.currentTarget.style.background = "#ffe9ec"}
                          onClick={() => handleDelete(device.id)}
                          title="Delete"
                        >
      <svg width="18" height="18" fill="none" stroke="#e57373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOpen && assigningDevice && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {assignModalStep === 1 && (
              <>
                <h4 style={styles.modalTitle}>Assign Device: {assigningDevice.deviceTag}</h4>
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  style={styles.modalInput}
                />
                <ul
                  style={{
                    maxHeight: 200,
                    overflowY: "auto",
                    padding: 0,
                    margin: 0,
                    width: "100%",
                  }}
                >
                  {employees
                    .filter((emp) =>
                      emp.fullName
                        .toLowerCase()
                        .includes(assignSearch.toLowerCase())
                    )
                    .map((emp) => (
                      <li
                        key={emp.id}
                        style={{ listStyle: "none", marginBottom: 8, width: "100%" }}
                      >
                        <button
                          style={{
                            ...styles.modalButton,
                            width: "100%",
                            background: "#f1f5f9",
                            color: "#2563eb",
                            border: "1.5px solid #cbd5e1",
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                          onClick={() => {
                            setSelectedAssignEmployee(emp);
                            setAssignModalStep(2);
                          }}
                        >
                          {emp.fullName}
                        </button>
                      </li>
                    ))}
                </ul>
                <button
                  onClick={closeAssignModal}
                  style={styles.modalButtonSecondary}
                >
                  Cancel
                </button>
              </>
            )}

            {assignModalStep === 2 && selectedAssignEmployee && (
              <>
                <h4 style={styles.modalTitle}>
                  Asset Accountability Form Options for: <span style={{ color: "#2563eb" }}>{selectedAssignEmployee.fullName}</span>
                </h4>
                <div style={styles.modalSection}>
                  <div style={styles.modalLabel}>New Issue:</div>
                  <div style={{ display: "flex", gap: 18, marginBottom: 12 }}>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        name="newIssueNew"
                        checked={assignModalChecks.newIssueNew}
                        onChange={handleAssignModalCheckbox}
                        style={styles.modalCheckbox}
                      /> Newly Purchased
                    </label>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        name="newIssueStock"
                        checked={assignModalChecks.newIssueStock}
                        onChange={handleAssignModalCheckbox}
                        style={styles.modalCheckbox}
                      /> Stock
                    </label>
                  </div>
                  <div style={styles.modalLabel}>Work From Home/Borrowed:</div>
                  <div style={{ display: "flex", gap: 18 }}>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        name="wfhNew"
                        checked={assignModalChecks.wfhNew}
                        onChange={handleAssignModalCheckbox}
                        style={styles.modalCheckbox}
                      /> Newly Purchased
                    </label>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        name="wfhStock"
                        checked={assignModalChecks.wfhStock}
                        onChange={handleAssignModalCheckbox}
                        style={styles.modalCheckbox}
                      /> Stock
                    </label>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <label style={{ display: "flex", alignItems: "center", fontWeight: 600, color: "#e57373" }}>
                      <input
                        type="checkbox"
                        name="temporaryDeploy"
                        checked={assignModalChecks.temporaryDeploy}
                        onChange={handleAssignModalCheckbox}
                        style={styles.modalCheckbox}
                      /> Temporary Deploy
                    </label>
                  </div>
                </div>
                {!assignModalShowGenerate && (
                  <button
                    style={styles.modalButton}
                    onClick={handleAssignModalNext}
                  >
                    Next
                  </button>
                )}
                {assignModalShowGenerate && (
                  <>
                    <div style={{ margin: "18px 0", width: "100%" }}>
                      {assignModalGenerating && (
                        <div style={{ marginBottom: 8, width: "100%" }}>
                          <div
                            style={{
                              width: "100%",
                              background: "#e9eef3",
                              borderRadius: 8,
                              height: 16,
                              marginBottom: 4,
                            }}
                          >
                            <div
                              style={{
                                width: `${assignModalProgress}%`,
                                background: "#2563eb",
                                height: 16,
                                borderRadius: 8,
                                transition: "width 0.3s",
                              }}
                            />
                          </div>
                          <span style={{ color: "#2563eb", fontWeight: 500 }}>
                            Generating: {assignModalProgress < 100 ? `${assignModalProgress}%` : "Done"}
                          </span>
                        </div>
                      )}
                      {!assignModalGenerating && !assignModalDocxBlob && (
                        <button
                          style={{ ...styles.modalButton, background: "#22c55e" }}
                          onClick={handleAssignModalGenerateDocx}
                        >
                          Generate Asset Accountability Form
                        </button>
                      )}
                      {assignModalDocxBlob && (
                        <button
                          style={styles.modalButton}
                          onClick={handleDownloadAndAssign}
                        >
                          Download DOCX
                        </button>
                      )}
                    </div>
                  </>
                )}
                <button
                  onClick={closeAssignModal}
                  style={styles.modalButtonSecondary}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* New Acquisitions Modal */}
      {showNewAcqModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.inventoryModalContent}>
            {!showManualSerialPanel ? (
              <>
                <h3 style={styles.inventoryModalTitle}>New Acquisitions (Bulk Add)</h3>
                <div style={{ display: "flex", gap: 12, width: "100%", marginBottom: 10 }}>
                  <div style={{ ...styles.inventoryInputGroup, flex: 1, marginBottom: 0 }}>
                    <label style={styles.inventoryLabel}>Device Type:</label>
                    <select
                      name="deviceType"
                      value={newAcqForm.deviceType}
                      onChange={handleNewAcqInput}
                      style={styles.inventoryInput}
                    >
                      <option value="">Select Device Type</option>
                      {deviceTypes.map((type) => (
                        <option key={type.label} value={type.label}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ ...styles.inventoryInputGroup, flex: 1, marginBottom: 0 }}>
                    <label style={styles.inventoryLabel}>Brand:</label>
                    <input
                      name="brand"
                      value={newAcqForm.brand}
                      onChange={handleNewAcqInput}
                      style={styles.inventoryInput}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, width: "100%", marginBottom: 10 }}>
                  <div style={{ ...styles.inventoryInputGroup, flex: 1, marginBottom: 0 }}>
                    <label style={styles.inventoryLabel}>Model:</label>
                    <input
                      name="model"
                      value={newAcqForm.model}
                      onChange={handleNewAcqInput}
                      style={styles.inventoryInput}
                    />
                  </div>
                  
                  <div style={{ ...styles.inventoryInputGroup, flex: 1, marginBottom: 0 }}>
                    <label style={styles.inventoryLabel}>Condition:</label>
                    <select
                      name="condition"
                      value={newAcqForm.condition}
                      onChange={handleNewAcqInput}
                      style={styles.inventoryInput}
                    >
                      <option value="">Select Condition</option>
                      {conditions.map((cond) => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ ...styles.inventoryInputGroup, marginBottom: 10 }}>
                  <label style={styles.inventoryLabel}>Remarks:</label>
                  <input
                    name="remarks"
                    value={newAcqForm.remarks}
                    onChange={handleNewAcqInput}
                    style={styles.inventoryInput}
                  />
                </div>
                <div style={{ ...styles.inventoryInputGroup, marginBottom: 10 }}>
                  <label style={styles.inventoryLabel}>Acquisition Date:</label>
                  <input
                    name="acquisitionDate"
                    type="date"
                    value={newAcqForm.acquisitionDate || ""}
                    onChange={handleNewAcqInput}
                    style={styles.inventoryInput}
                  />
                </div>
                <div style={{ ...styles.inventoryInputGroup, marginBottom: 10 }}>
                  <label style={styles.inventoryLabel}>Supplier:</label>
                  <input
                    name="supplier"
                    value={newAcqForm.supplier}
                    onChange={handleNewAcqInput}
                    style={styles.inventoryInput}
                    placeholder="Enter supplier name"
                  />
                </div>
                
                {/* Manual Serial Assignment Option */}
                <div style={{ ...styles.inventoryInputGroup, marginBottom: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", fontWeight: 500, fontSize: 13, color: "#2563eb" }}>
                    <input
                      type="checkbox"
                      checked={assignSerialManually}
                      onChange={handleManualSerialToggle}
                      style={{ marginRight: 6, accentColor: "#2563eb" }}
                    />
                    Assign Serial Manually
                  </label>
                </div>

                {assignSerialManually ? (
                  <div style={{ ...styles.inventoryInputGroup, marginBottom: 10 }}>
                    <label style={styles.inventoryLabel}>Quantity:</label>
                    <input
                      type="number"
                      value={manualQuantity}
                      onChange={handleQuantityChange}
                      style={styles.inventoryInput}
                      min="1"
                      max="100"
                      placeholder="Enter quantity"
                    />
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 12, width: "100%", marginBottom: 10 }}>
                    <div style={{ ...styles.inventoryInputGroup, flex: 1, marginBottom: 0 }}>
                      <label style={styles.inventoryLabel}>Start Tag (e.g. 0009):</label>
                      <input
                        name="startTag"
                        value={newAcqForm.startTag}
                        onChange={handleNewAcqInput}
                        style={styles.inventoryInput}
                        maxLength={4}
                        placeholder="0001"
                      />
                    </div>
                    <div style={{ ...styles.inventoryInputGroup, flex: 1, marginBottom: 0 }}>
                      <label style={styles.inventoryLabel}>End Tag (e.g. 0015):</label>
                      <input
                        name="endTag"
                        value={newAcqForm.endTag}
                        onChange={handleNewAcqInput}
                        style={styles.inventoryInput}
                        maxLength={4}
                        placeholder="0015"
                      />
                    </div>
                  </div>
                )}

                {newAcqError && <span style={{ color: "#e57373", fontSize: 12, marginBottom: 6 }}>{newAcqError}</span>}
                
                {/* Progress bar */}
                {newAcqLoading && (
                  <div style={{ width: "100%", marginBottom: 12 }}>
                    <div style={{
                      width: "100%",
                      background: "#e9eef3",
                      borderRadius: 8,
                      height: 8,
                      marginBottom: 6,
                    }}>
                      <div style={{
                        width: `${progress}%`,
                        background: "#2563eb",
                        height: 8,
                        borderRadius: 8,
                        transition: "width 0.3s",
                      }} />
                    </div>
                    <span style={{ color: "#2563eb", fontWeight: 500, fontSize: 12 }}>
                      {progress < 40 ? "Preparing devices..." : 
                       progress < 70 ? "Adding to database..." : 
                       progress < 100 ? "Generating document..." : "Complete!"}
                    </span>
                  </div>
                )}
                
                <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 8, width: "100%" }}>
                  <button
                    onClick={handleNewAcqSubmit}
                    disabled={newAcqLoading}
                    style={{ ...styles.inventoryModalButton, opacity: newAcqLoading ? 0.6 : 1 }}
                  >
                    {newAcqLoading ? "Adding..." : assignSerialManually ? "Proceed to Serial Entry" : "Add Devices"}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewAcqModal(false);
                      setAssignSerialManually(false);
                      setShowManualSerialPanel(false);
                      setManualSerials([]);
                      setManualQuantity(1);
                    }}
                    style={styles.inventoryModalButtonSecondary}
                    disabled={newAcqLoading}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              /* Manual Serial Entry Panel */
              <>
                <h3 style={styles.inventoryModalTitle}>
                  Enter Serial Numbers - {newAcqForm.deviceType} ({manualSerials.length} devices)
                </h3>
                
                <div style={{ 
                  marginBottom: 16, 
                  padding: 12, 
                  background: "#f1f5f9", 
                  borderRadius: 8, 
                  border: "1px solid #cbd5e1",
                  width: "100%"
                }}>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>
                    <strong>Device Details:</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569" }}>
                    Type: {newAcqForm.deviceType} | Brand: {newAcqForm.brand} | Model: {newAcqForm.model || "N/A"} | Condition: {newAcqForm.condition}
                  </div>
                </div>

                {/* Import Section */}
                <div style={{
                  width: "100%",
                  marginBottom: 16,
                  padding: 12,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8
                }}>
                  <div style={{ 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: "#374151", 
                    marginBottom: 8 
                  }}>
                    Quick Import Serial Numbers
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    color: "#64748b", 
                    marginBottom: 8 
                  }}>
                    Paste serial numbers below (one per line) to auto-fill the entry fields:
                  </div>
                  <textarea
                    style={{
                      width: "100%",
                      height: 80,
                      padding: 8,
                      border: "1px solid #d1d5db",
                      borderRadius: 4,
                      fontSize: 12,
                      fontFamily: "monospace",
                      resize: "vertical",
                      boxSizing: "border-box",
                      marginBottom: 8
                    }}
                    placeholder="Serial1&#10;Serial2&#10;Serial3&#10;..."
                    onChange={(e) => {
                      const importText = e.target.value;
                      if (importText.trim()) {
                        handleImportSerials(importText);
                      }
                    }}
                  />
                  <div style={{ 
                    fontSize: 11, 
                    color: "#6b7280", 
                    fontStyle: "italic" 
                  }}>
                    Tip: Copy from Excel/Notepad and paste here to quickly fill all serial fields
                  </div>
                </div>

                <div style={{ 
                  width: "100%",
                  maxHeight: 300,
                  overflowY: "auto",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 16,
                  background: "#fafbfc"
                }}>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
                    gap: 12 
                  }}>
                    {manualSerials.map((item, index) => (
                      <div key={item.id} style={{ 
                        background: "#fff",
                        padding: 10,
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                      }}>
                        <label style={{ 
                          ...styles.inventoryLabel, 
                          fontSize: 12, 
                          fontWeight: 600, 
                          color: "#374151",
                          marginBottom: 4
                        }}>
                          Device #{index + 1}
                        </label>
                        <input
                          type="text"
                          value={item.serial}
                          onChange={(e) => handleManualSerialChange(index, e.target.value)}
                          style={{ 
                            width: "100%",
                            padding: "6px 8px",
                            border: "1px solid #d1d5db",
                            borderRadius: 4,
                            fontSize: 13,
                            backgroundColor: "#fff",
                            boxSizing: "border-box"
                          }}
                          placeholder={`Enter serial number`}
                          maxLength={64}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {newAcqError && (
                  <div style={{ 
                    marginTop: 12, 
                    padding: 8, 
                    background: "#fef2f2", 
                    border: "1px solid #fecaca", 
                    borderRadius: 6,
                    color: "#dc2626",
                    fontSize: 12,
                    width: "100%"
                  }}>
                    {newAcqError}
                  </div>
                )}

                <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 10, width: "100%" }}>
                  <button
                    onClick={handleManualSerialSubmit}
                    disabled={newAcqLoading}
                    style={{ 
                      ...styles.inventoryModalButton, 
                      opacity: newAcqLoading ? 0.6 : 1,
                      background: "#22c55e"
                    }}
                  >
                    {newAcqLoading ? "Adding Devices..." : "Add All Devices"}
                  </button>
                  <button
                    onClick={() => setShowManualSerialPanel(false)}
                    style={styles.inventoryModalButtonSecondary}
                    disabled={newAcqLoading}
                  >
                    Back to Form
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;

const styles = {
  pageContainer: {
    padding: "32px 0 32px 0",
    maxWidth: "100%",
    background: "#f7f9fb",
    minHeight: "100vh",
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
  headerBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    padding: "0 24px",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#222e3a",
    letterSpacing: 1,
    margin: 0,
  },
  headerBarGoogle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 24,
    padding: "0 24px",
  },
  googleTitle: {
    color: "#233037",
    fontWeight: 800,
    fontSize: 28,
    marginBottom: 18,
    letterSpacing: 0,
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
  googleSearchBar: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: 24,
    boxShadow: "0 2px 8px rgba(68,95,109,0.10)",
    border: "1.5px solid #e0e7ef",
    padding: "2px 16px 2px 12px",
    width: 320,
    transition: "box-shadow  0.2s, border 0.2s",
    marginBottom: 0,
  },
  googleSearchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 17,
    color: "#233037",
    padding: "10px 0 10px 8px",
    width: "100%",
    fontWeight: 500,
  },
  buttonBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
    padding: "0 24px",
  },
  button: {
    background: "#70C1B3",
    color: "#233037",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    transition: "background 0.2s, box-shadow 0.2s",
    outline: "none",
    margin: 0,
  },
  buttonDisabled: {
    background: "#e9eef3",
    color: "#b0b8c1",
    cursor: "not-allowed",
  },
  tableContainer: {
    marginTop: 0,
    overflowX: "auto",
    padding: "0 24px",
  },
  table: {
    width: "100%",
    minWidth: 900,
    borderCollapse: "separate",
    borderSpacing: 0,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(68,95,109,0.10)",
    overflow: "hidden",
    tableLayout: 'auto',
  },
  th: {
    padding: "16px 12px",
    background: "#445F6D",
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    borderBottom: "2px solid #e0e7ef",
    textAlign: "left",
    letterSpacing: 0.2,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: "14px 12px",
    color: "#233037",
    fontSize: 15,
    borderBottom: "1px solid #e0e7ef",
    background: "#f7f9fb",
    verticalAlign: "middle",
    wordBreak: 'break-word',
  },
  iconButton: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: 18,
    padding: 6,
    borderRadius: 6,
    cursor: "pointer",
    marginRight: 4,
    transition: "background 0.2s, color 0.2s",
    outline: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonHover: {
    background: "#e0e7ef",
    color: "#2563eb",
  },
  deletingText: {
    marginLeft: 16,
    color: "#e57373",
    fontWeight: 500,
    fontSize: 15,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(34, 46, 58, 0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modalContent: {
    background: "#fff",
    padding: 28,
    borderRadius: 14,
    minWidth: 260,
    maxWidth: 340,
    boxShadow: "0 6px 24px rgba(34,46,58,0.13)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    border: "1.5px solid #e5e7eb",
    transition: "box-shadow 0.2s",
  },
  inventoryModalContent: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    minWidth: 480,
    maxWidth: 520,
    width: "70vw",
    boxShadow: "0 6px 24px rgba(34,46,58,0.13)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    position: "relative",
    border: "1.5px solid #e5e7eb",
    transition: "box-shadow 0.2s",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#2563eb",
    marginBottom: 16,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  inventoryModalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#2563eb",
    marginBottom: 14,
    letterSpacing: 0.5,
    textAlign: "center",
    width: "100%",
  },
  inventoryInputGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 10,
    width: "100%",
    minWidth: 140,
  },
  inventoryLabel: {
    alignSelf: "flex-start",
    fontWeight: 500,
    color: "#222e3a",
    marginBottom: 3,
    fontSize: 13,
  },
  inventoryInput: {
    width: '100%',
    minWidth: 0,
    fontSize: 13,
    padding: '6px 8px',
    borderRadius: 5,
    border: '1.2px solid #cbd5e1',
    background: '#f1f5f9',
    height: '30px',
    boxSizing: 'border-box',
    marginBottom: 0,
  },
  inventoryModalButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    transition: "background 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  inventoryModalButtonSmall: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "7px 14px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    marginLeft: 4,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    transition: "background 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  inventoryModalButtonSecondary: {
    background: "#e0e7ef",
    color: "#2563eb",
    border: "none",
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    marginLeft: 4,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    transition: "background 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  modalCheckbox: {
    accentColor: "#2563eb",
    width: 18,
    height: 18,
    marginRight: 8,
  },
  modalSection: {
    width: "100%",
    marginBottom: 14,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  modalLabel: {
    fontWeight: 500,
    color: "#222e3a",
    marginBottom: 5,
    fontSize: 15,
    textAlign: "left",
    width: "100%",
  },
  actionEditButton: {
    background: "#eaf7fa",
    border: "none",
    borderRadius: 12,
    width: 48,
    height: 48,
    padding: 0,
    cursor: "pointer",
    transition: "background 0.18s, box-shadow 0.18s",
    boxShadow: "0 1px 4px rgba(68,95,109,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionEditButtonHover: {
    background: "#d0f0f7",
  },
  actionDeleteButton: {
    background: "#ffe9ec",
    border: "none",
    borderRadius: 12,
    width: 48,
    height: 48,
    padding: 0,
    cursor: "pointer",
    transition: "background 0.18s, box-shadow 0.18s",
    boxShadow: "0 1px 4px rgba(68,95,109,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionDeleteButtonHover: {
    background: "#ffd6de",
  },
};