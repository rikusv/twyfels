<script lang="ts">
	import { timelineEvents } from '../../../stores'
	import TimelineEventForm from '../TimelineEventForm.svelte'
	import { TimelineEvent, timelineEventData } from '../../../timeline'

	$: events = timelineEvents.events
    let deleteId: string | undefined = undefined

	export let editingEvent: TimelineEvent | null = null

	const handleClickNew = () => {
		editingEvent = new TimelineEvent(timelineEventData())
	}

	const handleClickSave = async () => {
		await editingEvent?.save()
		editingEvent = null
	}

	const handleClickCancel = () => {
		editingEvent = null
	}

	const handleClickEdit = (event: TimelineEvent) => {
		editingEvent = event
	}

    const handleClickDeletePerson = (event: TimelineEvent) => {
		if (event.id === deleteId) {
			event.delete()
		} else {
			deleteId = event.id
		}
	}
</script>

<button on:click={handleClickNew} class="btn btn-primary my-3">New</button>

{#if editingEvent && !editingEvent.id}
	<TimelineEventForm timelineEvent={editingEvent} />
	<button on:click={handleClickSave} class="btn btn-primary mb-3">
        Save
    </button>
    <button on:click={handleClickCancel} class="btn btn-secondary mb-3">
        Cancel
    </button>
{/if}

<div class="list-group">
	{#if $events && $events.length}
		{#each $events as event}
			<div class="list-group-item">
				{#if editingEvent && event.id == editingEvent.id}
					<TimelineEventForm timelineEvent={event} />
					<button on:click={handleClickSave} class="btn btn-primary">
                        Save
                    </button>
					<button on:click={handleClickCancel} class="btn btn-secondary">
                        Cancel
                    </button>
				{:else}
					<div class="d-flex w-100 justify-content-between">
						<h5 class="mb-1">{event.data.text.headline}</h5>
						<div>
                            <button on:click={() => handleClickEdit(event)} class="btn btn-primary btn-sm">
                                Edit
                            </button>
                            <button on:click={() => handleClickDeletePerson(event)} class="btn btn-sm" class:btn-secondary={event.id != deleteId} class:btn-danger={event.id == deleteId}>
                                {event.id == deleteId ? 'Really delete' : 'Delete'}
                            </button>
                        </div>
					</div>
					<p class="mb-1">
                        {event.data.text.text}
                    </p>
					<small>{event.data.start_date.year}-{event.data.start_date.month}-{event.data.start_date.day} - {event.data.end_date.year}-{event.data.end_date.month}-{event.data.end_date.day}</small>
				{/if}
			</div>
		{/each}
	{/if}
</div>
