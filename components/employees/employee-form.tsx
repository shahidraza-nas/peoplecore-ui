"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Role, CreateEmployeeData } from "@/lib/types";

interface EmployeeFormProps {
  employee?: any;
  onSubmit: (data: CreateEmployeeData | Partial<any>) => Promise<void>;
  onCancel: () => void;
}

export default function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: employee?.first_name || "",
    last_name: employee?.last_name || "",
    email: employee?.email || "",
    phone_code: employee?.phone_code || "+1",
    phone: employee?.phone || "",
    password: "",
    role: employee?.role || Role.User,
    enable_2fa: employee?.enable_2fa || false,
    send_email: employee?.send_email !== false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = employee
        ? // For update, only send changed fields (excluding password if empty)
          Object.fromEntries(
            Object.entries(formData).filter(([key, value]) => {
              if (key === 'password' && !value) return false;
              return value !== employee[key];
            })
          )
        : // For create, send all data
          formData;

      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={loading || !!employee}
        />
        {employee && (
          <p className="text-xs text-zinc-500">Email cannot be changed after creation</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone_code">Code</Label>
          <Input
            id="phone_code"
            value={formData.phone_code}
            onChange={(e) => setFormData({ ...formData, phone_code: e.target.value })}
            placeholder="+1"
            disabled={loading}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
            maxLength={10}
            placeholder="9999999999"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password {employee ? "(Leave blank to keep current)" : "*"}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!employee}
            minLength={6}
            placeholder={employee ? "••••••••" : "At least 6 characters"}
            disabled={loading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select
          value={formData.role}
          onValueChange={(value: string) => setFormData({ ...formData, role: value as Role })}
          disabled={loading}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Role.User}>User</SelectItem>
            <SelectItem value={Role.Admin}>Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable_2fa">Two-Factor Authentication</Label>
            <p className="text-sm text-zinc-500">Require OTP for login</p>
          </div>
          <Switch
            id="enable_2fa"
            checked={formData.enable_2fa}
            onCheckedChange={(checked) => setFormData({ ...formData, enable_2fa: checked })}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="send_email">Email Notifications</Label>
            <p className="text-sm text-zinc-500">Send welcome email and updates</p>
          </div>
          <Switch
            id="send_email"
            checked={formData.send_email}
            onCheckedChange={(checked) => setFormData({ ...formData, send_email: checked })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {employee ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{employee ? "Update Employee" : "Create Employee"}</>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
