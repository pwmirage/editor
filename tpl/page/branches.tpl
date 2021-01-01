<script id="tpl-page-branches" type="text/x-dot-template">
<div class="mgContent">
	<div style="display: flex; align-items: baseline; column-gap: 10px;">
		<h2>Branch:</h2>

		<select class="branch" oninput="{serialize $page}.on_merge_branch_change(this.value);">
			{for branch of $branches}
				<option value="{@$branch.id}" {if $page.selected_branch == $branch}selected="true"{/if}>{@$branch.name.charAt(0).toUpperCase() + $branch.name.substring(1)} ({@$branch.id})</option>
			{/for}
		</select>

		{assign branch = $page.selected_branch}
		<span>Base: <a href="{@'/forum/thread/' + $branch.project_topic_id}">{@$branch.project_name} ({@$branch.project_id})</a></span>
	</div>

	<div style="display: flex; column-gap: 15px; margin-top: 16px;">
		<div class="left">
			<h2 style="margin-top: 0px;">History:</h2>

			<table class="table projects" style="margin-top: 8px; width: 250px;">
				<tbody>
					{for project of $page.selected_branch.history}
						<tr>
							<td style="width: 65px;" title="c{@$project.commit_id}">{@$project.id}</td>
							<td title="c{@$project.commit_id}"><a href="{@'/forum/thread/' + $project.topic_id}">{@$project.name}</a></td>
						</tr>
					{/for}
				</tbody>
			</table>
		</div>

		<div class="right" style="flex: 1;">
			<h2 style="margin-top: 0px;">Projects to merge:</h2>

			<table class="table projects" style="margin-top: 8px;">
				<tbody>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Base</th>
						<th>Last edit</th>
						<th>Action</th>
					</tr>
					{for project of $mergables}
						{if $project.base_commit_id && $project.base_branch_id != $page.selected_branch.id}
							{continue}
						{/if}
						<tr>
							<td style="width: 65px;">{@$project.id}</td>
							<td><a href="{@'/forum/thread/' + $project.topic_id}">{@$project.name}</a></td>
							<td>
								<a href="{@'/forum/thread/' + $project.base_topic_id}">{@$project.base_name || 'None'}</a>
								{if $project.base_name}
									{if $project.base_commit_id}
										<i class="fa fa-check" style="color: green;"></i>
									{else}
										<i class="fa fa-close" style="color: red;"></i>
									{/if}
								{/if}
							</td>
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
						{if $project.base_commit_id && $project.base_branch_id != $page.selected_branch.id}
							{continue}
						{/if}
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
	</div>
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
