import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { STATUS_INICIATIVA, STATUS_CONFIG, PERSPECTIVA_COLORS } from "./peUtils";

export default function IniciativasKanban({ items, onUpdate }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const itemId = result.draggableId;
    if (newStatus !== items.find(i => i.id === itemId)?.status) {
      onUpdate(itemId, "status", newStatus);
    }
  };

  const hoje = new Date();

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_INICIATIVA.map(status => {
          const sc = STATUS_CONFIG[status];
          const colItems = items.filter(i => (i.status || "Não Iniciado") === status);
          return (
            <div key={status} className="flex-shrink-0 w-72">
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border-t border-x ${sc.bg} ${sc.border}`}>
                <span className={`text-sm font-semibold ${sc.text}`}>{sc.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${sc.text}`}>{colItems.length}</span>
              </div>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-48 rounded-b-xl border-b border-x ${sc.border} p-2 space-y-2 transition-colors ${snapshot.isDraggingOver ? "bg-blue-50/50" : "bg-gray-50"}`}
                  >
                    {colItems.map((item, idx) => {
                      const pc = PERSPECTIVA_COLORS[item.perspectiva] || PERSPECTIVA_COLORS["FINANCEIRO"];
                      const atrasada = item.deadline && new Date(item.deadline) < hoje && status !== "Concluído";
                      return (
                        <Draggable key={item.id} draggableId={item.id} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm transition-shadow ${snapshot.isDragging ? "shadow-lg rotate-1" : "hover:shadow-md"}`}
                            >
                              {item.numero && (
                                <span className="font-mono text-xs text-gray-400 font-bold">{item.numero}</span>
                              )}
                              <p className="text-sm font-medium text-gray-800 mt-0.5 leading-snug">{item.iniciativa}</p>
                              <div className="flex gap-1 mt-2 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${pc.bg} ${pc.text} ${pc.border}`}>{item.perspectiva}</span>
                                {item.objetivo_estrategico && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">{item.objetivo_estrategico}</span>
                                )}
                              </div>
                              {item.responsavel && (
                                <p className="text-xs text-gray-400 mt-2">👤 {item.responsavel}</p>
                              )}
                              {item.deadline && (
                                <p className={`text-xs mt-1 ${atrasada ? "text-red-600 font-semibold" : "text-gray-400"}`}>
                                  📅 {atrasada ? "⚠️ " : ""}{new Date(item.deadline + "T12:00:00").toLocaleDateString("pt-BR")}
                                </p>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    {colItems.length === 0 && (
                      <p className="text-center text-xs text-gray-300 py-6">Arraste itens aqui</p>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}