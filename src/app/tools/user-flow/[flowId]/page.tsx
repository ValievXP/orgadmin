"use client";
import { useParams } from 'next/navigation';
import { UserFlowBuilder } from '@/lib/user-flow/FlowBuilder';

export default function UserFlowMvpBuilderPage() {
  const params = useParams<{ flowId: string }>();
  return <UserFlowBuilder edition="mvp" flowId={params.flowId} />;
}
