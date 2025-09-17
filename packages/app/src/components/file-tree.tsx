import { useLocal } from "@/context"
import type { LocalFile } from "@/context/local"
import { Collapsible, FileIcon, Tooltip } from "@/ui"
import { For, Match, Switch, Show, type ComponentProps, type ParentProps } from "solid-js"
import { Dynamic } from "solid-js/web"

export default function FileTree(props: {
  path: string
  class?: string
  nodeClass?: string
  level?: number
  onFileClick?: (file: LocalFile) => void
}) {
  const local = useLocal()
  const level = props.level ?? 0

  const Node = (p: ParentProps & ComponentProps<"div"> & { node: LocalFile; as?: "div" | "button" }) => (
    <Dynamic
      component={p.as ?? "div"}
      classList={{
        "p-0.5 w-full flex items-center gap-x-2 hover:bg-background-panel cursor-pointer": true,
        "bg-background-element": local.file.active()?.path === p.node.path,
        [props.nodeClass ?? ""]: !!props.nodeClass,
      }}
      style={`padding-left: ${level * 10}px`}
      {...p}
    >
      {p.children}
      <span
        classList={{
          "text-xs whitespace-nowrap truncate": true,
          "text-text-muted/40": p.node.ignored,
          "text-text-muted/80": !p.node.ignored,
          "!text-text": local.file.active()?.path === p.node.path,
          "!text-primary": local.file.changed(p.node.path),
        }}
      >
        {p.node.name}
      </span>
      <Show when={local.file.changed(p.node.path)}>
        <span class="ml-auto mr-1 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
      </Show>
    </Dynamic>
  )

  return (
    <div class={`flex flex-col ${props.class}`}>
      <For each={local.file.children(props.path)}>
        {(node) => (
          <Tooltip forceMount={false} openDelay={2000} value={node.path} placement="right">
            <Switch>
              <Match when={node.type === "directory"}>
                <Collapsible
                  forceMount={false}
                  open={local.file.node(node.path)?.expanded}
                  onOpenChange={(open) => (open ? local.file.expand(node.path) : local.file.collapse(node.path))}
                >
                  <Collapsible.Trigger>
                    <Node node={node}>
                      <Collapsible.Arrow size={16} class="text-text-muted/60 ml-1" />
                      <FileIcon
                        node={node}
                        expanded={local.file.node(node.path).expanded}
                        class="text-text-muted/60 -ml-1"
                      />
                    </Node>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <FileTree path={node.path} level={level + 1} onFileClick={props.onFileClick} />
                  </Collapsible.Content>
                </Collapsible>
              </Match>
              <Match when={node.type === "file"}>
                <Node node={node} as="button" onClick={() => props.onFileClick?.(node)}>
                  <div class="w-4 shrink-0" />
                  <FileIcon node={node} class="text-primary" />
                </Node>
              </Match>
            </Switch>
          </Tooltip>
        )}
      </For>
    </div>
  )
}
