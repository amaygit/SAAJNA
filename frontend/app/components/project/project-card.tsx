
import type { Project } from '@/types'
import React from 'react'

interface ProjectCardProps {
    project:Project;
    progress:number;
    workspaceId:string;
}
export const ProjectCard = ({
    project,
    progress,
    workspaceId,
  }: ProjectCardProps
) => {
  return (
    <div>ProjectCard</div>
  )
}

