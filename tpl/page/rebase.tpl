<script id="tpl-page-rebase" type="text/x-dot-template">
<div class="mgContent" style="min-height: 276px;">
	<div style="display: flex; flex-direction: row; gap: 8px; margin-top: 8px;">
		<div>Project: <a href="{@'/forum/thread/' + $project.topic_id}" class="externalURL"><b>{@$project.name} #{@$project.id}</b></a></div>
	</div>
	<div>Current base:</div>
	<div>
		<label class="project">
			<input type="radio" name="base" value="current" oninput="{serialize $page}.onradio(this);" data-fname="" checked>
			{@$project.base_name} #{@$project.base_project_id} <a href="{@'/forum/thread/' + $project.base_topic_id}" class="externalURL"></a>
			{if $project.base_edit_time != $project.base_project_edit_time}
				<div>(Older version)</div>
			{/if}
		</label>
	</div>
	<div>Rebase on:</div>
	<div class="branches">
		{for branch of $branches}
			<div class="branch">
				<label class="project">
					<div class="header">Branch {@$branch.name} (v{@$branch.version})</div>
					<div>
						<input type="radio" name="base" value="{@$branch.name}@{@$branch.head_commit_id}" oninput="{serialize $page}.onradio(this);" data-fname="{@$branch.head_commit_name}">
						{@$branch.head_commit_name}
						<a href="{@'/forum/thread/' + $branch.head_commit_topic_id}" class="externalURL"> </a>
					</div>
				</label>
			</div>
		{/for}
	</div>
	<div class="projects" style="margin-top: 8px;">
		<div class="flex-columns" style="margin-bottom: 8px;">
			<div class="v-centered">Rebase on a specific project: </div>
			<input type="text" oninput="{serialize $page}.onsearch(this.value);" style="flex: 1;" size='' autocomplete="off">
		</div>
		<div class="search-projects" style="margin-bottom: 10px;">
			{for project of $projects}
				<label class="project">
					<input type="radio" name="base" value="{@$project.id}" oninput="{serialize $page}.onradio(this);" data-fname="{@$project.name}">
					{@$project.name} #{@$project.id}
					<a href="{@'/forum/thread/' + $project.topic_id}" class="externalURL"> </a>
				</label>
			{/for}
			{if $projects.length == 10}
				<div>+ more</div>
			{/if}
			{if $projects.length == 0}
				<div>(No matching projects)</div>
			{/if}
		</div>
	</div>
	<div style="display: flex;">
		<div style="flex: 1;"></div>
		<a class="button buttonPrimary disabled" href="javascript:void(0);" onclick="{serialize $page}.rebase();">Rebase</a>
	</div>
</div>

{@@
<style>
.mgContent {
	display: flex;
	flex-direction: column;
	row-gap: 4px;

}

.mgContent .project-name {
	font-weight: bold;
}

.mgContent label {
	display: flex;
	flex-direction: row;
	height: auto;
}

.mgContent .branches {
	display: flex;
	flex-direction: row;
	column-gap: 8px;
	width: 200px;
}

.mgContent .branch {
	font-weight: bold;
}

.mgContent .branch .project {
	flex-direction: column;
}

.mgContent .branch .header {
	margin-left: 5px;
}

.mgContent .branch .project {
	min-width: 175px;
}

.mgContent .projects {
	flex: 1;
}

.mgContent .search-projects {
	display: flex;
	flex-wrap: wrap;
	column-gap: 6px;
	row-gap: 6px;
}

.mgContent .search-projects > * {
	width: 300px;
}

.mgContent .project {
	background-color: #dccfcf;
	border-radius: 5px;
	padding: 5px;
	cursor: pointer;
	min-width: 175px;
	font-weight: bold;
}

.mgContent label.project {
	padding-left: 1px;
}

.mgContent .project:hover {
	background-color: #9c7878;
}

.branch {
}

</style>
@@}
</script>
