
import { useEmailSequences } from './marketing-automation/useEmailSequences';
import { useABTesting } from './marketing-automation/useABTesting';
import { useWorkflows } from './marketing-automation/useWorkflows';
import { useEmailScheduling } from './marketing-automation/useEmailScheduling';

export const useMarketingAutomation = () => {
  const emailSequencesHook = useEmailSequences();
  const abTestingHook = useABTesting();
  const workflowsHook = useWorkflows();
  const emailSchedulingHook = useEmailScheduling();

  return {
    // Email Sequences
    emailSequences: emailSequencesHook.emailSequences,
    sequenceSteps: emailSequencesHook.sequenceSteps,
    isLoadingSequences: emailSequencesHook.isLoadingSequences,
    createEmailSequence: emailSequencesHook.createEmailSequence,
    createSequenceStep: emailSequencesHook.createSequenceStep,
    triggerEmailSequence: emailSequencesHook.triggerEmailSequence,
    
    // A/B Testing
    abTests: abTestingHook.abTests,
    isLoadingABTests: abTestingHook.isLoadingABTests,
    createABTest: abTestingHook.createABTest,
    getABTestResults: abTestingHook.getABTestResults,
    
    // Workflows
    workflows: workflowsHook.workflows,
    isLoadingWorkflows: workflowsHook.isLoadingWorkflows,
    createWorkflow: workflowsHook.createWorkflow,
    
    // Email Scheduling
    scheduleEmail: emailSchedulingHook.scheduleEmail,
  };
};
