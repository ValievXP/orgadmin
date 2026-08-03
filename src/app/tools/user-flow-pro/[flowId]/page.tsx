"use client";
import { useParams } from 'next/navigation';
import { UserFlowBuilder } from '@/lib/user-flow/FlowBuilder';

export default function UserFlowProBuilderPage() {
  const params = useParams<{ flowId: string }>();
  return <UserFlowBuilder edition="pro" flowId={params.flowId} />;
}
