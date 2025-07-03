<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> f0728713345a7f3cc6ca76c8842bc190f923e087
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Assets from "./pages/Assets";
import Employees from "./pages/Employees";
import Clients from "./pages/Clients";
import UnitSpecs from "./pages/UnitSpecs";
<<<<<<< HEAD
import { db, auth } from "./utils/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Login({ onLogin, error, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
=======
import UserManagement from "./pages/UserManagement";
import { db, auth } from "./utils/firebase";
import {
  signInWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Login({ onLogin, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const styles = {
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#233037f2",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
    },
    modalContent: {
      background: "#fff",
      padding: "36px 40px",
      borderRadius: 18,
      minWidth: 340,
      maxWidth: 420,
      boxShadow: "0 12px 48px rgba(37,99,235,0.18)",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 18,
    },
    title: {
      margin: "0 0 18px 0",
      fontWeight: 800,
      color: "#233037",
      letterSpacing: 0.5,
      fontSize: 20,
      textAlign: "center",
      fontFamily: "Segoe UI, Arial, sans-serif",
      lineHeight: 1.3,
    },
    input: {
      padding: "10px 14px",
      borderRadius: 8,
      border: "1px solid #cbd5e1",
      fontSize: 16,
      background: "#fff",
      minWidth: 220,
      marginRight: 0,
      width: "100%",
      color: "#233037",
      outline: "none",
      marginBottom: 2,
      transition: "border 0.2s",
    },
    actionBtn: {
      background: "#70C1B3",
      color: "#233037",
      border: "none",
      borderRadius: 8,
      padding: "10px 22px",
      fontWeight: 700,
      fontSize: 15,
      cursor: "pointer",
      marginLeft: 0,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      transition: "background 0.2s, box-shadow 0.2s",
      width: "100%",
      marginTop: 2,
    },
    error: {
      color: "#F25F5C",
      textAlign: "center",
      fontWeight: 600,
      fontSize: 14,
      marginTop: -8,
      marginBottom: -8,
    },
  };
  return (
    <div style={styles.modalOverlay}>
>>>>>>> f0728713345a7f3cc6ca76c8842bc190f923e087
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onLogin(email, password);
        }}
<<<<<<< HEAD
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 16,
          boxShadow: "0 8px 32px #0003",
          minWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <h2 style={{ textAlign: "center", color: "#667eea", marginBottom: 8 }}>
          AIMS Login
=======
        style={styles.modalContent}
      >
        <h2 style={styles.title}>
          JOII IT Assets & Inventory
          <br />
          Management System
>>>>>>> f0728713345a7f3cc6ca76c8842bc190f923e087
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
=======
          style={styles.input}
>>>>>>> f0728713345a7f3cc6ca76c8842bc190f923e087
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
        {error && (
          <div style={{ color: "#e53e3e", textAlign: "center" }}>{error}</div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            border: "none",
            cursor: "pointer",
          }}
        >
          Login
        </button>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span style={{ fontSize: 14 }}>Don't have an account? </span>
          <button
            type="button"
            onClick={onShowRegister}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Register
          </button>
        </div>
=======
          style={styles.input}
        />
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" style={styles.actionBtn}>
          Login
        </button>
>>>>>>> f0728713345a7f3cc6ca76c8842bc190f923e087
      </form>
    </div>
  );
}

<<<<<<< HEAD
function Register({ onBackToLogin }) {
  const [step, setStep] = useState(1);
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Step 1: Admin password check
  if (step === 1) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (adminPass === "JoiiIT@2019!") {
              setStep(2);
              setAdminError("");
            } else {
              setAdminError("Incorrect admin password.");
            }
          }}
          style={{
            background: "#fff",
            padding: 40,
            borderRadius: 16,
            boxShadow: "0 8px 32px #0003",
            minWidth: 340,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <h2
            style={{ textAlign: "center", color: "#667eea", marginBottom: 8 }}
          >
            Admin Verification
          </h2>
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
            }}
            autoFocus
          />
          {adminError && (
            <div style={{ color: "#e53e3e", textAlign: "center" }}>
              {adminError}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 16,
              border: "none",
              cursor: "pointer",
            }}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onBackToLogin}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Back to Login
          </button>
        </form>
      </div>
    );
  }

  // Step 2: Register user
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!email || !password) {
            setRegisterError("Email and password are required.");
            return;
          }
          try {
            const cred = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );
            await setDoc(doc(db, "users", cred.user.uid), { email, role });
            setRegisterSuccess(true);
            setRegisterError("");
          } catch (err) {
            setRegisterError(err.message);
          }
        }}
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 16,
          boxShadow: "0 8px 32px #0003",
          minWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <h2 style={{ textAlign: "center", color: "#667eea", marginBottom: 8 }}>
          Create Account
        </h2>
        {registerSuccess ? (
          <>
            <div
              style={{
                color: "#38a169",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Account created successfully!
            </div>
            <button
              type="button"
              onClick={onBackToLogin}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 16,
                border: "none",
                cursor: "pointer",
              }}
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 16,
              }}
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 16,
              }}
            />
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <label style={{ fontSize: 15, color: "#333" }}>
                <input
                  type="radio"
                  name="role"
                  value="viewer"
                  checked={role === "viewer"}
                  onChange={() => setRole("viewer")}
                  style={{ marginRight: 6 }}
                />
                Viewer
              </label>
              <label style={{ fontSize: 15, color: "#333" }}>
                <input
                  type="radio"
                  name="role"
                  value="editor"
                  checked={role === "editor"}
                  onChange={() => setRole("editor")}
                  style={{ marginRight: 6 }}
                />
                Editor
              </label>
            </div>
            {registerError && (
              <div style={{ color: "#e53e3e", textAlign: "center" }}>
                {registerError}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 16,
                border: "none",
                cursor: "pointer",
              }}
            >
              Register
            </button>
            <button
              type="button"
              onClick={onBackToLogin}
              style={{
                background: "none",
                border: "none",
                color: "#667eea",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Back to Login
            </button>
          </>
        )}
      </form>
    </div>
  );
=======
function DebugClaims() {
  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      auth.currentUser.getIdTokenResult(true).then((idTokenResult) => {
        console.log("Custom Claims:", idTokenResult.claims);
      });
    }
  }, []);
  return null;
>>>>>>> f0728713345a7f3cc6ca76c8842bc190f923e087
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
<<<<<<< HEAD
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
=======
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // NEW

  // Persist login state using Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch custom claims
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        const claims = idTokenResult.claims;
        // Optionally fetch Firestore user data
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        let userData = { uid: firebaseUser.uid, email: firebaseUser.email };
        if (userDoc.exists()) {
          userData = { ...userDoc.data(), ...userData };
        }
        setUser({ ...userData, ...claims });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setAuthLoading(false); // NEW
    });
    return () => unsubscribe();
  }, []);
>>>>>>> f0728713345a7f3cc6ca76c8842bc190f923e087

  const handleLogin = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
<<<<<<< HEAD
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (userDoc.exists()) {
        setIsAuthenticated(true);
        setLoginError("");
        setUser({ ...userDoc.data(), uid: cred.user.uid });
      } else {
        setLoginError("No user role found.");
      }
=======
      // Fetch custom claims from Firebase Auth
      const idTokenResult = await cred.user.getIdTokenResult(true);
      const claims = idTokenResult.claims;
      // Optionally fetch Firestore user data
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      let userData = { uid: cred.user.uid, email: cred.user.email };
      if (userDoc.exists()) {
        userData = { ...userDoc.data(), ...userData };
      }
      // Merge custom claims into user object
      setUser({ ...userData, ...claims });
      setIsAuthenticated(true);
      setLoginError("");
>>>>>>> f0728713345a7f3cc6ca76c8842bc190f923e087
    } catch (err) {
      setLoginError("Invalid email or password.");
    }
  };

<<<<<<< HEAD
  if (!isAuthenticated) {
    if (showRegister) {
      return <Register onBackToLogin={() => setShowRegister(false)} />;
    }
    return (
      <Login
        onLogin={handleLogin}
        error={loginError}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <Router>
      <Header user={user} />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 16 }}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/inventory" element={<Inventory user={user} />} />
            <Route path="/assets" element={<Assets user={user} />} />
            <Route path="/employees" element={<Employees user={user} />} />
            <Route path="/clients" element={<Clients user={user} />} />
            <Route path="/unit-specs" element={<UnitSpecs user={user} />} />
          </Routes>
        </main>
=======
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1D2435",
          flexDirection: "column",
        }}
      >
        <img
          src={require("./layout/joii.png")}
          alt="JOII Logo"
          style={{
            height: 40,
            width: "auto",
            marginBottom: 24,
            filter: "drop-shadow(0 4px 16px #0006)",
          }}
        />
        <div
          style={{
            width: 38,
            height: 38,
            border: "4px solid #FFE066",
            borderTop: "4px solid #1D2435",
            borderRadius: "50%",
            animation: "joii-spin 1s linear infinite",
            marginBottom: 18,
          }}
        />
        <style>{`
          @keyframes joii-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div
          style={{
            fontSize: 18,
            color: "#FFE066",
            fontWeight: 700,
            letterSpacing: 1.2,
            textShadow: "0 2px 8px #0005",
          }}
        >
          Loading...
        </div>
>>>>>>> f0728713345a7f3cc6ca76c8842bc190f923e087
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <Router>
      <Header user={user} />
      <div style={{ display: "flex" }}>
        <Sidebar user={user} />
        <main style={{ flex: 1, padding: 16 }}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/inventory" element={<Inventory user={user} />} />
            <Route path="/assets" element={<Assets user={user} />} />
            <Route path="/employees" element={<Employees user={user} />} />
            <Route path="/clients" element={<Clients user={user} />} />
            <Route path="/unit-specs" element={<UnitSpecs user={user} />} />
            <Route
              path="/user-management"
              element={<UserManagement currentUser={user} />}
            />
          </Routes>
        </main>
      </div>
      <DebugClaims />
    </Router>
  );
}

export default App;
