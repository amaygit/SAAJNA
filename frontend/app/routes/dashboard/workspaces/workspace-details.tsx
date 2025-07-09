import React, { useState } from 'react'
import { useParams } from 'react-router';
import {useGetWorkspaceQuery} from '@/hooks/use-workspace';
import type { Project, Workspace } from "@/types";
const WorkspaceDetails = () => {
    const {workspaceId} = useParams<{workspaceId:string}>();
    const [iseCreatProject, setIsCreateProject] = useState(false);
    const [isInviteMember, setIsInviteMember] = useState(false);

    if(!workspaceId) {
        return <div>No workspace found</div>
    }

    const {data:workspace}=useGetWorkspaceQuery(workspaceId) as {
        data:{
            workspace:Workspace;
            projects:Project[];
        }
    };
  return (
    <div>
        <h1>
            WorkspaceDetails
        </h1>
    </div>
  )
}

export default WorkspaceDetails