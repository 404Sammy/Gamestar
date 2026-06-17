import { redirect } from "next/navigation";

export default function TeamManagerRootPage() {
  // Direct client hit streams into the gate state verification step inside the layout engine
  redirect("/team-manager/select-tournament");
}