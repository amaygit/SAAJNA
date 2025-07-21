import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { InviteProjectMemberDialog } from "@/components/project/invite-members";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteProject, UseProjectQuery } from "@/hooks/use-project";
import { getProjectProgress } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskStatus } from "@/types";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { TaskBoard } from "@/components/task/task-board";

const ProjectDetails = () => {
  const { projectId, workspaceId } = useParams<{
    projectId: string;
    workspaceId: string;
  }>();
  const navigate = useNavigate();

  const [isCreateTask, setIsCreateTask] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskStatus | "All">("All");

  const { data, isLoading } = UseProjectQuery(projectId!) as {
    data: {
      tasks: Task[];
      project: Project;
    };
    isLoading: boolean;
  };

  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();

  if (isLoading) return <Loader />;

  const { project, tasks } = data;
  const projectProgress = getProjectProgress(tasks);

  const handleTaskClick = (taskId: string) => {
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
  };

  const handleDeleteProject = () => {
    if (!projectId) return;
    if (!confirm("Are you sure you want to delete this case? This action cannot be undone.")) return;

    deleteProject(projectId, {
      onSuccess: () => {
        toast.success("Case deleted successfully.");
        navigate(`/workspaces/${workspaceId}`);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to delete case.");
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton />
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500">{project.description}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 min-w-32">
            <div className="text-sm text-muted-foreground">Progress:</div>
            <div className="flex-1">
              <Progress value={projectProgress} className="h-2" />
            </div>
            <span className="text-sm text-muted-foreground">{projectProgress}%</span>
          </div>

          <Button onClick={() => setIsCreateTask(true)}>Add Case Milestone</Button>
          <Button onClick={() => setIsInviteDialogOpen(true)}>Invite</Button>
          <Button variant="destructive" onClick={handleDeleteProject} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Entire Case Milestone"}
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setTaskFilter("All")}>All Cases</TabsTrigger>
            <TabsTrigger value="todo" onClick={() => setTaskFilter("To Do")}>Filed Cases</TabsTrigger>
            <TabsTrigger value="in-progress" onClick={() => setTaskFilter("In Progress")}>Case In Progress</TabsTrigger>
            <TabsTrigger value="done" onClick={() => setTaskFilter("Done")}>Closed Cases</TabsTrigger>
          </TabsList>

          <div className="flex items-center text-sm space-x-2">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="outline" className="bg-background">
              {tasks.filter((task) => task.status === "To Do").length} Filed Cases
            </Badge>
            <Badge variant="outline" className="bg-background">
              {tasks.filter((task) => task.status === "In Progress").length} Case In Progress
            </Badge>
            <Badge variant="outline" className="bg-background">
              {tasks.filter((task) => task.status === "Done").length} Closed Cases
            </Badge>
          </div>
        </div>

        <TabsContent value="all">
          <div className="grid grid-cols-3 gap-4">
            <TaskBoard  tasks={tasks.filter(t => t.status === "To Do")} onTaskClick={handleTaskClick} />
            <TaskBoard tasks={tasks.filter(t => t.status === "In Progress")} onTaskClick={handleTaskClick} />
            <TaskBoard tasks={tasks.filter(t => t.status === "Done")} onTaskClick={handleTaskClick} />
          </div>
        </TabsContent>

        <TabsContent value="todo">
          <TaskBoard  tasks={tasks.filter(t => t.status === "To Do")} onTaskClick={handleTaskClick}  />
        </TabsContent>

        <TabsContent value="in-progress">
          <TaskBoard tasks={tasks.filter(t => t.status === "In Progress")} onTaskClick={handleTaskClick}  />
        </TabsContent>

        <TabsContent value="done">
          <TaskBoard tasks={tasks.filter(t => t.status === "Done")} onTaskClick={handleTaskClick}  />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTaskDialog
        open={isCreateTask}
        onOpenChange={setIsCreateTask}
        projectId={projectId!}
        projectMembers={project.members as any}
      />
      <InviteProjectMemberDialog
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        projectId={projectId!}
      />
    </div>
  );
};

export default ProjectDetails;
