"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import ComponentPalette from "@/components/ComponentPalette";
import { Box } from "@mui/material";

export default function Home() {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    console.log("DragEnd", { active: active?.id, over: over?.id, data: active?.data?.current });
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: "flex", minHeight: "100vh", p: 2 }}>
        <ComponentPalette />
        <Box sx={{ flex: 1, ml: 2, display: "flex", alignItems: "flex-start" }}>
          {/* 畫布將在 Task 4 加入 */}
        </Box>
      </Box>
    </DndContext>
  );
}