"use client";

import { useState } from "react";
import { TaskHeader } from "@/components/tasks/task-header";
import { TaskFilters, TaskView } from "@/components/tasks/task-filters";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskCalendar } from "@/components/tasks/task-calendar";
import { AddTaskModal } from "@/components/tasks/add-task-modal";
import { TaskDrawer } from "@/components/report/task-drawer";
import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  const [activeView, setActiveView] = useState<TaskView>("kanban");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: "",
    assignee: "",
    priority: "",
    meeting: "",
    status: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      assignee: "",
      priority: "",
      meeting: "",
      status: "",
    });
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  // Mock total counts
  const stats = {
    total: 47,
    inProgress: 12,
    overdue: 3
  };

  return (
    <div className="min-h-screen bg-dash-bg animate-in fade-in duration-700">
      <div className="max-w-[1280px] mx-auto px-8 py-7">
        
        {/* Header Section */}
        <TaskHeader 
          total={stats.total}
          inProgress={stats.inProgress}
          overdue={stats.overdue}
          onAddTask={() => setIsModalOpen(true)}
        />

        {/* Filter Bar */}
        <TaskFilters 
          activeView={activeView}
          onViewChange={setActiveView}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Main View Content */}
        <div className="animate-in slide-in-from-bottom-2 duration-500">
          {activeView === "kanban" && (
             <div onClick={() => handleTaskClick({ title: "Mock Kanban Task", status: "In Progress", priority: "High", assignee: "David Wu", due: "Mar 22" })}>
               <KanbanBoard />
             </div>
          )}
          
          {activeView === "table" && (
            <div onClick={() => handleTaskClick({ title: "Table Task Detail", status: "Done", priority: "Medium", assignee: "David Wu", due: "Mar 20" })}>
              <TaskTable />
            </div>
          )}

          {activeView === "calendar" && (
            <div onClick={() => handleTaskClick({ title: "Calendar Task Detail", status: "To Do", priority: "Low", assignee: "Priya Singh", due: "Mar 24" })}>
               <TaskCalendar />
            </div>
          )}
        </div>
      </div>

      {/* Modals & Drawers */}
      <AddTaskModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onAdd={(task) => console.log("New Task:", task)} 
      />
      
      <TaskDrawer 
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        task={selectedTask}
      />
    </div>
  );
}
