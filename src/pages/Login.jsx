
// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const navigate = useNavigate();

  // ============================================================
  // PASSWORD RECOVERY LISTENER
  // ============================================================

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      console.log("[Login] Auth event:", event);

      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        setForgotPassword(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter your email address and password.");
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        console.error("[Login] Sign in error:", error);
        alert(error.message);
        return;
      }

      // SUCCESS → go to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("[Login] Unexpected error:", error);

      alert(
        "Unable to connect to the authentication service. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email address first.");
      return;
    }

    setResetLoading(true);

    try {
      /*
       * The user receives a secure password-reset link by email.
       *
       * The link returns the user to this Login page.
       *
       * Supabase then triggers PASSWORD_RECOVERY above.
       */

      const redirectUrl =
        `${window.location.origin}/login`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: redirectUrl,
          }
        );

      if (error) {
        console.error(
          "[Login] Password reset error:",
          error
        );

        alert(error.message);
        return;
      }

      alert(
        "Password reset email sent.\n\nPlease check your email and click the secure password reset link."
      );

      setForgotPassword(false);
    } catch (error) {
      console.error(
        "[Login] Password reset unexpected error:",
        error
      );

      alert(
        "Unable to send the password reset email. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  // ============================================================
  // UPDATE PASSWORD AFTER EMAIL RECOVERY
  // ============================================================

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "Your new password must be at least 6 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "The new password and confirmation password do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        console.error(
          "[Login] Password update error:",
          error
        );

        alert(error.message);
        return;
      }

      /*
       * Sign the user out after changing the password.
       * They can then log in normally using the new password.
       */

      await supabase.auth.signOut();

      setPasswordRecovery(false);
      setNewPassword("");
      setConfirmPassword("");
      setPassword("");

      alert(
        "Your password has been changed successfully.\n\nYou can now log in with your new password."
      );
    } catch (error) {
      console.error(
        "[Login] Password update unexpected error:",
        error
      );

      alert(
        "Unable to update your password. Please try the reset link again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PASSWORD RECOVERY SCREEN
  // ============================================================

  if (passwordRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

        <form
          onSubmit={handleUpdatePassword}
          className="w-full max-w-md space-y-4 bg-white p-8 rounded-xl shadow-md"
        >

          <div className="text-center mb-6">

            <h2 className="text-2xl font-bold">
              Create New Password
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Enter your new HireResQ password below.
            </p>

          </div>

          {/* New Password */}

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            className="w-full border p-3 rounded"
            autoComplete="new-password"
          />

          {/* Confirm Password */}

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            className="w-full border p-3 rounded"
            autoComplete="new-password"
          />

          {/* Update Password */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded"
          >
            {loading
              ? "Updating Password..."
              : "Update Password"}
          </button>

        </form>

      </div>
    );
  }

  // ============================================================
  // FORGOT PASSWORD SCREEN
  // ============================================================

  if (forgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

        <form
          onSubmit={handleForgotPassword}
          className="w-full max-w-md space-y-4 bg-white p-8 rounded-xl shadow-md"
        >

          <div className="text-center mb-6">

            <h2 className="text-2xl font-bold">
              Forgot Password?
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Enter your email address and we will send you a secure password reset link.
            </p>

          </div>

          {/* Email */}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border p-3 rounded"
            autoComplete="email"
          />

          {/* Send Reset Email */}

          <button
            type="submit"
            disabled={resetLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded"
          >
            {resetLoading
              ? "Sending..."
              : "Send Reset Email"}
          </button>

          {/* Back to Login */}

          <button
            type="button"
            onClick={() => setForgotPassword(false)}
            className="w-full text-sm text-gray-600 hover:text-red-600 py-2"
          >
            ← Back to Login
          </button>

        </form>

      </div>
    );
  }

  // ============================================================
  // NORMAL LOGIN SCREEN
  // ============================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 bg-white p-8 rounded-xl shadow-md"
      >

        <h2 className="text-2xl font-bold">
          Login
        </h2>

        {/* Email */}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-3 rounded"
          autoComplete="email"
        />

        {/* Password */}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-3 rounded"
          autoComplete="current-password"
        />

        {/* Forgot Password */}

        <div className="text-right">

          <button
            type="button"
            onClick={() => setForgotPassword(true)}
            className="text-sm text-red-600 hover:text-red-700 hover:underline"
          >
            Forgot Password?
          </button>

        </div>

        {/* Submit */}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded"
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

      </form>

    </div>
  );
}
