import { useMemo } from "react";
import type { Task } from "@/types";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void; // ✅ Added this
}

const STATUS_COLUMNS = ["To Do", "In Progress", "Review", "Done"] as const;

export function TaskBoard({ tasks, onTaskClick }: TaskBoardProps) {
  const groupedTasks = useMemo(() => {
    return STATUS_COLUMNS.reduce((acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    }, {} as Record<(typeof STATUS_COLUMNS)[number], Task[]>);
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATUS_COLUMNS.map((status) => (
        <div key={status}>
          <Card className="bg-muted shadow-md">
            <CardHeader className="font-bold text-center">{status}</CardHeader>
            <CardContent className="space-y-2">
              {groupedTasks[status].map((task) => (
                <div
                  key={task._id}
                  className="bg-white rounded-xl p-3 shadow hover:shadow-md transition cursor-pointer"
                  onClick={() => onTaskClick?.(task._id)} // ✅ Supports click
                >
                  <h4 className="font-semibold">{task.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                  <Badge className="mt-2">{task.status}</Badge>
                </div>
              ))}
              {groupedTasks[status].length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  No tasks
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
