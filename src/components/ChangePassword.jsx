"use client"

import { useState } from "react"
import axios from "axios"
import { server } from "../constants/config"

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear specific field error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate old password
    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = "Current password is required"
    }

    // Validate new password
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required"
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Clear previous messages
    setSuccessMessage("")
    setErrorMessage("")

    // Validate form
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem("authToken")

      const response = await axios.post(
        `${server}api/v1/user/change-password`,
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setSuccessMessage(response.data.message || "Password changed successfully")
        // Reset form after successful password change
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setErrorMessage(response.data.message || "Failed to change password")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setErrorMessage(
        error.response?.data?.message || "An error occurred while changing your password. Please try again.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Change Password</h2>
      </div>

      <div className="rounded-lg border border-[rgb(var(--color-border))] bg-white shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6 pb-4">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-[rgb(var(--color-text-primary))]">
            Update Your Password
          </h3>
          <p className="text-sm text-[rgb(var(--color-text-muted))]">
            Enter your current password and a new password to update your credentials
          </p>
        </div>

        <div className="p-6 pt-0">
          {successMessage && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
              <p>{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="oldPassword" className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">
                Current Password
              </label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  errors.oldPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-[rgb(var(--color-border))] focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                } px-3 py-2 text-sm focus:outline-none focus:ring-1`}
                placeholder="Enter your current password"
                disabled={isLoading}
              />
              {errors.oldPassword && <p className="text-xs text-red-600">{errors.oldPassword}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  errors.newPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-[rgb(var(--color-border))] focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                } px-3 py-2 text-sm focus:outline-none focus:ring-1`}
                placeholder="Enter your new password"
                disabled={isLoading}
              />
              {errors.newPassword && <p className="text-xs text-red-600">{errors.newPassword}</p>}
              <p className="text-xs text-[rgb(var(--color-text-muted))]">Password must be at least 6 characters long</p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[rgb(var(--color-text-primary))]"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  errors.confirmPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-[rgb(var(--color-border))] focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                } px-3 py-2 text-sm focus:outline-none focus:ring-1`}
                placeholder="Confirm your new password"
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-md bg-[rgb(var(--color-primary))] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--color-primary-dark))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-lg border border-[rgb(var(--color-border))] bg-white p-6 shadow-sm">
        <h4 className="mb-2 text-sm font-semibold text-[rgb(var(--color-text-primary))]">Password Security Tips</h4>
        <ul className="space-y-2 text-sm text-[rgb(var(--color-text-muted))]">
          <li className="flex items-start">
            <span className="mr-2 text-green-500">✓</span>
            Use a combination of letters, numbers, and special characters
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-green-500">✓</span>
            Avoid using easily guessable information like birthdays or names
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-green-500">✓</span>
            Use a different password for each of your important accounts
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-green-500">✓</span>
            Consider using a password manager to generate and store strong passwords
          </li>
        </ul>
      </div>
    </div>
  )
}

