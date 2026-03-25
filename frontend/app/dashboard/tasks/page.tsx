"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TaskHeader } from "@/components/tasks/task-header";
import { TaskFilters, TaskView } from "@/components/tasks/task-filters";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskCalendar } from "@/components/tasks/task-calendar";
import { AddTaskModal } from "@/components/tasks/add-task-modal";
import { TaskDrawer } from "@/components/report/task-drawer";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const supabase = createClient();

  useEffect(() => {
    async function fetchTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, meetings(title)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        const formatted = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          priority: t.priority || "Medium",
          status: (t.status || "todo").toLowerCase().replace(" ", ""),
          source: t.meetings?.title || "Direct Task",
          assignee: { name: t.assignee || "Unassigned" },
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString() : "TBD",
          isOverdue: t.due_date ? new Date(t.due_date) < new Date() && t.status !== "Done" : false
        }));
        setTasks(formatted);
      }
      setLoading(false);
    }

    fetchTasks();
  }, []);

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

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'inprogress').length,
    overdue: tasks.filter(t => t.isOverdue).length
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
          {loading ? (
             <div className="flex justify-center py-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
             </div>
          ) : (
            <>
              {activeView === "kanban" && (
                <KanbanBoard tasks={tasks} />
              )}
              
              {activeView === "table" && (
                <TaskTable tasks={tasks} />
              )}

              {activeView === "calendar" && (
                <TaskCalendar tasks={tasks} />
              )}
            </>
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
