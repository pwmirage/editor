<script id="tpl-page-branches" type="text/x-dot-template">
<div class="mgContent">
	<h2>Projects to merge:</h2>

	<table class="table projects" style="margin-top: 8px;">
		<tbody>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>Last edit</th>
				<th>Action</th>
			</tr>
			{for project of $mergables}
				<tr>
					<td style="width: 65px;">{@$project.id}</td>
					<td><a href="{@'/forum/thread/' + $project.topic_id}">{@$project.name}</a></td>
					{assign date = new Date($project.edit_time * 1000)}
					<td style="width: 200px;">{@$date.toLocaleDateString("en-US", \{ year: 'numeric', month: 'long', day: 'numeric' \})}<br>{@$date.toLocaleTimeString("en-US")}</td>
					<td style="width: 225px;">
						<a class="button" href="javascript:void(0);" onclick="{serialize $page}.merge({@$project.id}, {@$project.revision});"><i class="fa fa-plug fa-button" title="Merge"></i>Merge</a>
						<a class="button" href="javascript:void(0);" onclick="{serialize $page}.defer({@$project.id}, true);" style="margin-left: 8px;"><i class="fa fa-history fa-button" title="Defer"></i>Defer</a>
					</td>
				</tr>
			{/for}
		</tbody>
	</table>

	<h2 style="margin-top: 40px;">Current Branches:</h2>

	<table class="table" style="margin-top: 8px; table-layout: fixed;">
		<tbody>
			<tr>
				<th>No.</th>
				<th>Name</th>
				<th>Current Head</th>
			</tr>
			{for branch of $branches}
				<tr>
					<td style="width: 65px;">{@$branch.id}</td>
					<td>{@$branch.name.charAt(0).toUpperCase() + $branch.name.slice(1)}</td>
					<td><a href="{@'/forum/thread/' + $branch.project_topic_id}">{@$branch.project_name} ({@$branch.project_id})</a></td>
				</tr>
			{/for}
		</tbody>
	</table>

	<h2 style="margin-top: 40px;">Deferred projects:</h2>

	<table class="table projects" style="margin-top: 8px;">
		<tbody>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>Last edit</th>
				<th>Action</th>
			</tr>
			{for project of $deferred}
				<tr>
					<td style="width: 65px;">{@$project.id}</td>
					<td><a href="{@'/forum/thread/' + $project.topic_id}">{@$project.name}</a></td>
					{assign date = new Date($project.edit_time * 1000)}
					<td style="width: 200px;">{@$date.toLocaleDateString("en-US", \{ year: 'numeric', month: 'long', day: 'numeric' \})}<br>{@$date.toLocaleTimeString("en-US")}</td>
					<td style="width: 250px;">
						<a class="button" href="javascript:void(0);" onclick="{serialize $page}.merge({@$project.id}, {@$project.revision});"><i class="fa fa-plug fa-button" title="Merge"></i>Merge</a>
						<a class="button" href="javascript:void(0);" onclick="{serialize $page}.defer({@$project.id}, false);" style="margin-left: 8px;"><i class="fa fa-history fa-button" title="Un-Defer"></i>Un-Defer</a>
					</td>
				</tr>
			{/for}
		</tbody>
	</table>

</div>

{@@
<style>
.mgContent h2 {
	font-size: 14px;
	font-weight: bold;
}

.mgContent .fa-button {
	cursor: pointer;
}

.mgContent .projects .fa-button {
	font-size: 17px;
	line-height: 6px;
	margin-right: 6px;
	margin-left: -4px;
}

</style>
@@}
</script>
