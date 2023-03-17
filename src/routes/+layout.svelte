<script>
	import { onMount } from 'svelte'
	
	import { error, progress, user, token } from '../stores'
	import { getAuth, signInWithPopup, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth'

	import { browser } from '$app/environment'
	
	onMount(async () => {
		if (browser) {
			// this works
			await import('bootstrap/dist/css/bootstrap.min.css')
			await import('bootstrap/dist/js/bootstrap.min.js')
		}
	})
	
	export const loginWithGoogle = () => {
		const provider = new GoogleAuthProvider()
		const auth = getAuth()

		signInWithPopup(auth, provider)
			.then((result) => {
				const credential = GoogleAuthProvider.credentialFromResult(result)
				user.set(result.user)
				token.set(credential ? credential.accessToken || '' : '')
			})
			.catch((error) => {
				const errorCode = error.code
				const errorMessage = error.message
			});
	};
</script>

<div class="container-fluid px-0">
	<nav class="navbar navbar-expand-lg bg-body-tertiary">
		<div class="container-fluid">
			<a class="navbar-brand" href="/">Twyfels</a>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarSupportedContent"
				aria-controls="navbarSupportedContent"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<div class="collapse navbar-collapse" id="navbarSupportedContent">
				<ul class="navbar-nav me-auto mb-2 mb-lg-0">
					{#if $token}
						<li class="nav-item">
							<a class="nav-link active" aria-current="page" href="/timeline">Timeline</a>
						</li>
						<li class="nav-item">
							<a class="nav-link active" aria-current="page" href="/timeline/list">Timeline Edit</a>
						</li>
					{/if}
				</ul>
				<span>
					{#if $token}
						{$user.displayName}
					{:else}
						<ul class="navbar-nav me-auto mb-2 mb-lg-0">
							<li class="nav-item dropdown">
								<a
									class="nav-link dropdown-toggle"
									href="#"
									role="button"
									data-bs-toggle="dropdown"
									aria-expanded="false"
								>
									Login
								</a>
								<ul class="dropdown-menu">
									<li><a on:click={loginWithGoogle} class="dropdown-item" href="#">Google</a></li>
								</ul>
							</li>
						</ul>
					{/if}
				</span>
			</div>
		</div>
	</nav>

	{#if $error}
		<div class="alert alert-danger alert-dismissible fade show" role="alert">
			<strong>Error:</strong>
			{$error}
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" />
		</div>
	{/if}

	{#each $progress as p}
		<div class="progress" role="progressbar">
			<div class="progress-bar" style="width: {p.percentage}%">{p.name}</div>
		</div>
	{/each}

	{#if $token}
		<slot />
	{:else}
		<p>
			This intends to be a place on the interwebs for the Hayats from Twyfelspoort, South Africa.
		</p>
		<p>Please log in to see more stuff.</p>
	{/if}
</div>
