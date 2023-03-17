<script lang="ts">
	import type { TimelineEvent } from '../../timeline'
	export let timelineEvent: TimelineEvent
    let data = timelineEvent.data
	const sameDates = () => {
		data.end_date = { ...data.start_date }
	}
</script>

<form>

    <div class="input-group mb-2">
		<span class="input-group-text">Headline</span>
		<input type="test" bind:value={data.text.headline} class="form-control" />
	</div>

    <div class="form-floating mb-2">
		<textarea bind:value={data.text.text} class="form-control" id="text" style="height: 100px" />
		<label for="text">Description</label>
	</div>

	<div class="input-group mb-2">
		<span class="input-group-text">Start date</span>
		<input
			type="number"
			placeholder="Year"
			bind:value={data.start_date.year}
			class="form-control"
		/>
		<input
			type="number"
			placeholder="Month"
			bind:value={data.start_date.month}
			class="form-control"
		/>
		<input type="number" placeholder="Day" bind:value={data.start_date.day} class="form-control" />
	</div>

	<div class="input-group mb-2">
		<span class="input-group-text">End date</span>
		<input type="number" placeholder="Year" bind:value={data.end_date.year} class="form-control" />
		<input
			type="number"
			placeholder="Month"
			bind:value={data.end_date.month}
			class="form-control"
		/>
		<input type="number" placeholder="Day" bind:value={data.end_date.day} class="form-control" />
		<button on:click={sameDates} class="btn btn-outline-secondary" type="button">
            Same as start
        </button>
	</div>

	<div class="input-group mb-2">
		<span class="input-group-text">Media</span>
		<input type="text" placeholder="URL" bind:value={data.media.url} class="form-control" />
        <input type="file" bind:files={timelineEvent.mediaFiles} class="form-control">
	</div>

    <div class="input-group mb-2">
		<span class="input-group-text">Media thumbnail</span>
		<input type="text" placeholder="URL" bind:value={data.media.thumbnail} class="form-control" />
        <input type="file" bind:files={timelineEvent.mediaThumbnailFiles} class="form-control">
	</div>

	<div class="input-group mb-2">
		<span class="input-group-text">Media Texts</span>
		<input type="text" placeholder="Title" bind:value={data.media.title} class="form-control" />
		<input type="text" placeholder="Caption" bind:value={data.media.caption} class="form-control" />
	</div>

	<div class="input-group mb-2">
		<span class="input-group-text">Background color</span>
		<input
			type="text"
			placeholder="Color"
			bind:value={data.background.color}
			class="form-control"
		/>
	</div>
</form>
