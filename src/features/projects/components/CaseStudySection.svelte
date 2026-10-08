<script lang="ts">
  import { Cpu, Gauge, Network } from '@lucide/svelte';
  import Card from '@/shared/ui/Card.svelte';
  import Input from '@/shared/ui/Input.svelte';
  import Textarea from '@/shared/ui/Textarea.svelte';
  import ListEditor from '@/shared/ui/ListEditor.svelte';
  import type { ProjectForm } from '../project-form.svelte';

  let { form }: { form: ProjectForm } = $props();
  // Local alias: avoids Svelte's ownership warning when binding through a non-bindable prop.
  const project = $derived(form.project);
</script>

<Card title="Case study page">
  <div class="flex flex-col gap-8">
    <div class="grid gap-4 md:grid-cols-2">
      <Input label="Subtitle" bind:value={project.subtitle} placeholder="e.g. Local-first IoT crane telemetry platform" />
      <Input
        label="Architecture section title (optional)"
        bind:value={project.architectureTitle}
        placeholder="e.g. Deployment architecture"
      />
    </div>

    <div class="grid gap-8 lg:grid-cols-2">
      <ListEditor
        bind:items={project.metrics}
        title="Key metrics"
        icon={Gauge}
        addLabel="Add metric"
        emptyText="No metrics (e.g. 99.9% uptime, <50ms latency)."
        compact
        create={() => ({ value: '', label: '' })}
      >
        {#snippet children(item)}
          <div class="grid grid-cols-2 gap-2">
            <Input placeholder="Value (99.9%)" bind:value={item.value} aria-label="Metric value" />
            <Input placeholder="Label (Uptime)" bind:value={item.label} aria-label="Metric label" />
          </div>
        {/snippet}
      </ListEditor>

      <ListEditor
        bind:items={project.techSpecs}
        title="Technical specifications"
        icon={Cpu}
        addLabel="Add spec"
        emptyText="No specs (e.g. Microcontroller: ESP32)."
        compact
        create={() => ({ label: '', value: '' })}
      >
        {#snippet children(item)}
          <div class="grid grid-cols-2 gap-2">
            <Input placeholder="Name (Backend)" bind:value={item.label} aria-label="Spec name" />
            <Input placeholder="Value (FastAPI / Python)" bind:value={item.value} aria-label="Spec value" />
          </div>
        {/snippet}
      </ListEditor>
    </div>

    <ListEditor
      bind:items={project.architectureNodes}
      title="Architecture diagram nodes"
      icon={Network}
      addLabel="Add node"
      emptyText="No nodes (e.g. Edge devices, MQTT broker, FastAPI cluster)."
      itemLabel="Node #"
      create={() => ({ icon: 'server', title: '', desc: '' })}
    >
      {#snippet children(item)}
        <div class="grid gap-3 md:grid-cols-[10rem_1fr]">
          <Input label="Icon" placeholder="server, cpu, cloud" bind:value={item.icon} />
          <Input label="Title" placeholder="MQTT Broker" bind:value={item.title} />
          <Textarea
            class="md:col-span-2"
            label="Description"
            rows={2}
            placeholder="Mosquitto cluster handling real-time telemetry"
            bind:value={item.desc}
          />
        </div>
      {/snippet}
    </ListEditor>
  </div>
</Card>
