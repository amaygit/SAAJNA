import type { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { inviteMemberSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Check, Copy, Mail } from "lucide-react";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { useInviteProjectMember } from "@/hooks/use-project";

interface InviteProjectMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

const ROLES = ["admin", "member", "viewer"] as const;

export const InviteProjectMemberDialog = ({
  isOpen,
  onOpenChange,
  projectId,
}: InviteProjectMemberDialogProps) => {
  const [inviteTab, setInviteTab] = useState("email");
  const [linkCopied, setLinkCopied] = useState(false);

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const { mutate, isPending } = useInviteProjectMember();

  const onSubmit = async (data: InviteMemberFormData) => {
    if (!projectId) return;

    mutate(
      {
        projectId,
        ...data,
      },
      {
        onSuccess: () => {
          toast.success("Project invite sent successfully");
          form.reset();
          setInviteTab("email");
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Something went wrong");
          console.error(error);
        },
      }
    );
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/project-invite/${projectId}`
    );
    setLinkCopied(true);

    setTimeout(() => setLinkCopied(false), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Project</DialogTitle>
        </DialogHeader>

        <Tabs value={inviteTab} onValueChange={setInviteTab} defaultValue="email">
          <TabsList>
            <TabsTrigger value="email" disabled={isPending}>
              Send Email
            </TabsTrigger>
            <TabsTrigger value="link" disabled={isPending}>
              Share Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter email" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Role</FormLabel>
                      <FormControl>
                        <div className="flex gap-3 flex-wrap">
                          {ROLES.map((role) => (
                            <label
                              key={role}
                              className="flex items-center cursor-pointer gap-2"
                            >
                              <input
                                type="radio"
                                value={role}
                                className="peer hidden"
                                checked={field.value === role}
                                onChange={() => field.onChange(role)}
                              />
                              <span
                                className={cn(
                                  "w-7 h-7 rounded-full border-2 border-blue-300 flex items-center justify-center transition-all duration-300 hover:shadow-lg bg-blue-900 text-white",
                                  field.value === role &&
                                    "ring-2 ring-blue-500 ring-offset-2"
                                )}
                              >
                                {field.value === role && (
                                  <span className="w-3 h-3 rounded-full bg-white" />
                                )}
                              </span>
                              <span className="capitalize">{role}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="link">
            <div className="grid gap-4">
              <Label>Share this link to invite people</Label>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/project-invite/${projectId}`}
                />
                <Button onClick={handleCopyInviteLink} disabled={isPending}>
                  {linkCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can join this project
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
