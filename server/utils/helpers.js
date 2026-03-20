export function buildOverview(meetings) {
  const summary = {
    totalMeetings: meetings.length,
    runningMeetings: 0,
    completedMeetings: 0,
    reviewMeetings: 0,
    totalTasks: 0,
    totalApprovals: 0,
    totalProposals: 0,
    totalErrors: 0,
  };

  for (const meeting of meetings) {
    if (meeting.status === "running") summary.runningMeetings += 1;
    if (meeting.status === "completed") summary.completedMeetings += 1;
    if (meeting.status === "needs_review") summary.reviewMeetings += 1;
    summary.totalTasks += meeting.task_count || 0;
    summary.totalApprovals += meeting.approval_count || 0;
    summary.totalProposals += meeting.proposal_count || 0;
    summary.totalErrors += meeting.error_count || 0;
  }

  return summary;
}

export function buildSnapshotSummary(snapshot) {
  const completedAgents = snapshot.agent_statuses?.filter((a) => a.status === "completed").length || 0;
  const failedAgents = snapshot.agent_statuses?.filter((a) => a.status === "failed").length || 0;
  const pendingApprovals = snapshot.approvals?.filter((a) => a.status === "pending").length || 0;

  return {
    completedAgents,
    failedAgents,
    pendingApprovals,
    taskCount: snapshot.tasks?.length || 0,
    workflowCount: snapshot.workflows?.length || 0,
    proposalCount: snapshot.execution_proposals?.length || 0,
    errorCount: snapshot.errors?.length || 0,
  };
}
