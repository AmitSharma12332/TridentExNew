"use client"

/* eslint-disable react/prop-types */
import { CreditCard, Mail, Shield, User, UserCircle, Wallet } from "lucide-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Loader from "../components/Loader"

const Profile = () => {
  const { user } = useSelector((state) => state.userReducer)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Simulate loading the profile data
    if (user?._id) {
      setLoading(false)
    }
  }, [user?._id])

  const ProfileItem = ({ icon: Icon, label, value, statusColor }) => (
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5 text-[rgb(var(--color-text-muted))]" />
      <div>
        <p className="text-sm text-[rgb(var(--color-text-muted))]">{label}</p>
        <p className={`font-medium ${statusColor || "text-[rgb(var(--color-text-primary))]"}`}>{value}</p>
      </div>
    </div>
  )

  const renderProfileContent = () => (
    <div className="w-full max-w-2xl mx-auto rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[rgb(var(--color-primary))] flex items-center gap-2 mb-6">
          <User className="w-6 h-6" />
          Profile
        </h2>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-[rgb(var(--color-background-hover))] rounded-full uppercase flex items-center justify-center text-2xl font-bold text-[rgb(var(--color-text-primary))]">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">{user?.name}</h2>
            <span className="inline-block px-2 py-1 text-xs font-semibold text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary-light))] rounded-full">
              {user?.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileItem icon={UserCircle} label="Username" value={user?.name} />
          <ProfileItem icon={Wallet} label="Wallet Balance" value={`${user?.currency} ${user?.amount}`} />
          <ProfileItem icon={CreditCard} label="Preferred Currency" value={user?.currency?.toUpperCase()} />
          <ProfileItem icon={Mail} label="Email" value={user?.email} />
          <ProfileItem icon={User} label="Gender" value={user?.gender} />
          <ProfileItem
            icon={Shield}
            label="Account Status"
            value={user?.status}
            statusColor="text-[rgb(var(--color-primary))]"
          />
        </div>
      </div>
    </div>
  )

  if (loading) return <Loader />
  if (error) return <p className="text-[rgb(var(--color-text-primary))]">Error: {error}</p>

  return (
    <div className="">
      <div className="max-w-full mx-auto p-2">
        {/* Content Area */}
        <div className="bg-[rgb(var(--color-background))] rounded-lg p-4 overflow-y-auto border border-[rgb(var(--color-border))]">
          {renderProfileContent()}
        </div>
      </div>
    </div>
  )
}

export default Profile

