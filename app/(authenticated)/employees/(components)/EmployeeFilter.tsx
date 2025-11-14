"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
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

  const applyFilters = () => {
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

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search, role, status]);

  const handleReset = () => {
    setSearch("");
    setRole("all");
    setStatus("all");
  };

  const hasFilters = search || role !== "all" || status !== "all";

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="User">User</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={setStatus}
          disabled={disabled || isPending}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasFilters && (
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={disabled || isPending}
            size="icon"
            title="Reset filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
