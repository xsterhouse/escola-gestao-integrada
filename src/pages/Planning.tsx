
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PlanningHeader from "@/components/planning/PlanningHeader";
import PlanningForm from "@/components/planning/PlanningForm";
import PlanningList from "@/components/planning/PlanningList";
import PlanningTransfer from "@/components/planning/PlanningTransfer";
import PlanningImport from "@/components/planning/PlanningImport";

const Planning = () => {
  const { isAuthenticated, currentSchool } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!currentSchool) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PlanningHeader />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <PlanningForm />
          <PlanningList />
        </div>
        <div className="space-y-6">
          <PlanningTransfer />
          <PlanningImport />
        </div>
      </div>
    </div>
  );
};

export default Planning;
