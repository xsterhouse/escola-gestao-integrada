
import { useState, useCallback } from 'react';

export function useAccountingNavigation() {
  const [activeTab, setActiveTab] = useState("manual");
  const [guidedFlow, setGuidedFlow] = useState({
    showGuide: false,
    currentStep: 0,
    steps: [
      { id: 'date', label: 'Informe a data do lançamento', completed: false },
      { id: 'value', label: 'Digite o valor total', completed: false },
      { id: 'debit', label: 'Configure a conta de débito', completed: false },
      { id: 'credit', label: 'Configure a conta de crédito', completed: false },
      { id: 'history', label: 'Preencha os históricos', completed: false },
      { id: 'save', label: 'Salve o lançamento', completed: false }
    ]
  });

  const navigateToTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const startGuidedFlow = useCallback(() => {
    setGuidedFlow(prev => ({
      ...prev,
      showGuide: true,
      currentStep: 0,
      steps: prev.steps.map(step => ({ ...step, completed: false }))
    }));
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setGuidedFlow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      ),
      currentStep: Math.min(prev.currentStep + 1, prev.steps.length - 1)
    }));
  }, []);

  const getCurrentStepInfo = useCallback(() => {
    const currentStep = guidedFlow.steps[guidedFlow.currentStep];
    const completedSteps = guidedFlow.steps.filter(step => step.completed).length;
    const totalSteps = guidedFlow.steps.length;
    
    return {
      current: currentStep,
      progress: (completedSteps / totalSteps) * 100,
      isLastStep: guidedFlow.currentStep === totalSteps - 1,
      isComplete: completedSteps === totalSteps
    };
  }, [guidedFlow]);

  return {
    activeTab,
    setActiveTab,
    navigateToTab,
    guidedFlow,
    startGuidedFlow,
    completeStep,
    getCurrentStepInfo
  };
}
