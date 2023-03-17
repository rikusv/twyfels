<script>
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { timelineEvents } from '../../stores'
	

	onMount(async () => {
		if (browser) {
			const TL = await import('@knight-lab/timelinejs')
			await import('@knight-lab/timelinejs/dist/css/timeline.css')
			timelineEvents.events.subscribe((events) => {
			if (events !== undefined && events.length) {
				const t = document.querySelector('#timeline-embed')
				if (t) {
					t.innerHTML = ''
					const timeline = new TL.Timeline('timeline-embed', {
						events: events.map((e) => e.dataCopy)
					})
				}
			}
		})
		}
		
	})
</script>

<div id="timeline-embed" style="width: 100%; height: calc(100vh - 56px);" />
