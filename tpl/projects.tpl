<script id="tpl-projects" type="text/x-dot-template">
<div id="root">
	<div class="headline">
		Open a recent project or create a new one
	</div>
	<div class="recent">
		<div class="create">
			<i class="fa fa-plus"></i><span>Create</span>
		</div>
		{for project of $projects.recent}
		<a href="{@ROOT_URL + '?id=' + $project.id}" class="{if $project.last_open_time <= $project.last_edit_time}bold{/if}" onclick="Editor.open_project({@$project.id}); this.classList.remove('bold'); event.preventDefault();">
			<img src="{@Item.get_icon(164)}" alt="">
			<span>{@$project.name}</span>
		</a>
		{/for}
	</div>

	<div class="chooser">
		<div class="categories">
			<div onclick="{serialize $projects}.select_tab('my')" class="{if $projects.cur_tab == 'my'}selected{/if}">My projects</div>
			<div onclick="{serialize $projects}.select_tab('all')" class="{if $projects.cur_tab == 'all'}selected{/if}">All projects</div>
			<div onclick="{serialize $projects}.select_tab('review')" class="{if $projects.cur_tab == 'review'}selected{/if}">Awaiting review</div>
			<div onclick="{serialize $projects}.select_tab('merged')" class="{if $projects.cur_tab == 'merged'}selected{/if}">Merged</div>
			<div onclick="{serialize $projects}.select_tab('trashed')" class="{if $projects.cur_tab == 'trashed'}selected{/if}">Trashed</div>
		</div>
	</div>

	<div class="projects-container">
		<div class="search">
			<input type="text" placeholder="(Search ...)" id="search" autocomplete="off">
		</div>

		<div class="loading" style="position: relative; width: 100%; z-index: 99; {if !$loading}display: none;{/if}">
			<div class="spinner" style="position: absolute; top: 25px;">
				<span class="icon icon48 fa-spinner"></span>
				<span>Loading ...</span>
			</div>
		</div>

		<table class="projects">
			<tr>
				<th>Name</th>
				<th>Status</th>
				<th style="width: 186px;">Owner</th>
				<th style="width: 186px;">Edit time</th>
				<th style="width: 50px;"></th>
			</tr>

			{for project of $projects.list}
				<tr class="{if $project.last_open_time <= $project.last_edit_time}bold{/if}" onclick="Editor.open_project({@$project.id}); this.classList.remove('bold'); event.preventDefault();">
					<td>
						<a class="name" href="{@ROOT_URL + '?id=' + $project.id}">
							<img src="{@Item.get_icon(164)}" alt="">
							<span style="">{@$project.name}</span>
						</a>
					</td>
					<td>
						<a class="labels" href="{@ROOT_URL + '?id=' + $project.id}">
							<div class="badge green">Fix</div>
							{assign status = Projects.status.find(s => s.id == $project.status)}
							<div class="badge {@$status.color}">{@$status.name}</div>
						</div>
					</td>
					<td>
						<a href="{@ROOT_URL + '?id=' + $project.id}">
							{@$project.username}
						</a>
					</td>
					<td><a href="{@ROOT_URL + '?id=' + $project.id}">
						{@Projects.DateUtil.getTimeElement(new Date($project.last_edit_time * 1000)).outerHTML}
					</a></td>
					<td>...</td>
				</tr>
			{/for}
		</table>

		<a class="button buttonPrimary" style="float: right; margin-top: 14px;" href="javascript:void(0);" onclick="{serialize $page}.new_patch();">New project</a>
	</div>
</div>

{@@
<style>
#root {
	position: absolute;
	width: 100%;
	height: calc(100% - 50px);
	overflow-y: auto;
	padding-bottom: 80px;
	background: white;
}

#root > * {
	padding: 24px 10%;
}

.search {
	display: flex;
	padding-bottom: 4px;
}

.search > input {
	flex: 1;
}

#root > .headline {
	background: #f1f3f4;
	padding-top: 30px;
	padding-bottom: 8px;
	font-size: 15px;
	font-weight: bold;
}

#root > .recent {
	display: flex;
	background: #f1f3f4;
	column-gap: 10px;
	padding-top: 10px;
}

.recent > * {
	border: 1px solid #dadce0;
	border-radius: 5px;
	padding: 20px;
	background: white;
	box-shadow: 0px 0px 2px 0px rgb(0 0 0 / 10%);
	cursor: pointer;
	display: flex;
	align-items: center;
}

.recent > *:hover {
	border: 1px solid #bf4444;
}

.recent > * > span {
	margin-left: 6px;
	overflow-wrap: break-word;
	max-width: 100px;
	overflow: hidden;
	line-height: 20px;
	max-height: 40px;

	overflow: hidden;
	text-overflow: ellipsis;
	white-space: initial;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.recent > .create {
	width: 120px;
	display: flex;
	justify-content: center;
	background-size: 10px 10px;
	background-position: -6px -5px;
	background-image:
		linear-gradient(to right, #efefef 1px, transparent 1px),
		linear-gradient(to bottom, #efefef 1px, transparent 1px);
}

#root > .chooser {
	background: #f1f3f4;
	padding-top: 0;
	padding-bottom: 0;
	border-bottom: 1px solid #dadce0;
}

.categories {
	display: flex;
	column-gap: 10px;
}

.categories > * {
	padding: 10px 18px;
	border: 1px solid #dadce0;
	margin-bottom: -1px;
	background: #eaeaea;
	cursor: pointer;
}

.categories > .selected {
	background: white;
	border-bottom: none;
}

.projects {
	border-collapse: collapse;
	width: 100%;
}

.projects td, .projects th {
	border: none;
}

.projects th {
	padding: 8px;
}

.projects tr:not(:first-child):not(:last-child) { border-bottom: 1px solid #ddd; }
.projects tr:not(:first-child):not(.loading):hover {
	background-color: #ddd;
	cursor: pointer;
}

.projects th {
	padding-bottom: 20px;
	text-align: left;
}

.recent a,
.projects a {
	color: #502c2c;
}

.projects a {
	padding: 8px;
}

.projects .name {
	display: flex;
	column-gap: 6px;
	align-items: center;
}

.projects tr.bold .name,
.recent .bold span {
	font-weight: bold;
}

.projects img {
	width: 20px;
	height: 20px;
}

.projects .labels {
	display: flex;
	column-gap: 5px;
}

@keyframes showCurtain {
	0% { transform: scaleY(0); }
	100% { transform: scaleY(1); }
}

@keyframes hideCurtain {
	0% { transform: scaleY(1); }
	100% { transform: scaleY(0) }
}

@keyframes stretchHeigh {
	0%, 40%, 100% { transform: scaleY(0.05); }
	20% { transform: scaleY(1); }
}

@keyframes fadeIn {
	0% { opacity: 0; }
	100% { opacity: 1; }
}

@keyframes fadeOut {
	0% { opacity: 1; }
	100% { opacity: 0; }
}

#curtain.showCurtain, #curtain.hideCurtain { display: block; }
#curtain.showCurtain > #loader { animation: fadeIn 0.2s linear both; }
#curtain.hideCurtain > #loader { animation: fadeOut 0.2s linear both; }
#curtain.showCurtain > #loader > div { animation: stretchHeigh 0.8s infinite ease-in-out; }
#curtain.showCurtain > .curtain { animation: showCurtain 250ms ease-in-out both; }
#curtain.hideCurtain > .curtain { animation: hideCurtain 250ms ease-in-out both; animation-delay: 0.2s; }

#curtain .top {
	top: 0;
	transform-origin: 0 0;
}

#curtain .bottom {
	bottom: 0;
	transform-origin: 0 100%;
}

#curtain > div {
	z-index: 100;
}
</style>
@@}
</script>
