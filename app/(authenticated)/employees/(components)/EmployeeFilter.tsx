"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeFilterProps {
  disabled?: boolean;
}

export default function EmployeeFilter({ disabled }: EmployeeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [role, setRole] = useState(searchParams.get("role") || "all");
  const [status, setStatus] = useState(searchParams.get("active") || "all");

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    
    if (search) {
      params.set("q", search);
    } else {
      params.delete("q");
    }
    
    if (role && role !== "all") {
      params.set("role", role);
    } else {
      params.delete("role");
    }
    
    if (status && status !== "all") {
      params.set("active", status);
    } else {
      params.delete("active");
    }
    
    params.delete("page");

    startTransition(() => {
      router.push(`/employees?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setSearch("");
    setRole("all");
    setStatus("all");
    
    startTransition(() => {
      router.push("/employees");
    });
  };

  const hasFilters = search || role !== "all" || status !== "all";

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !disabled && handleSearch()}
            className="pl-9"
            disabled={disabled || isPending}
          />
        </div>

        {/* Role Filter */}
        <Select
          value={role}
          onValueChange={setRole}
          disabled={disabled || isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Employee">Employee</SelectItem>
            <SelectItem value="User">User</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={setStatus}
          disabled={disabled || isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSearch}
          disabled={disabled || isPending}
          className="flex-1 sm:flex-initial"
        >
          {isPending ? "Searching..." : "Search"}
        </Button>
        {hasFilters && (
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={disabled || isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
