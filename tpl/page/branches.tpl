<script id="tpl-page-branches" type="text/x-dot-template">
<div class="mgContent" style="min-height: 576px;">
	<div style="display: flex; align-items: baseline; column-gap: 10px;">
		<h2>Branch:</h2>

		<select class="branch" oninput="{serialize $page}.on_merge_branch_change(this.value);">
			{for branch of $branches}
				<option value="{@$branch.id}" {if $page.selected_branch == $branch}selected="true"{/if}>{@$branch.id}. {@$branch.name.charAt(0).toUpperCase() + $branch.name.substring(1)} ({@$branch.history[0]?.id})</option>
			{/for}
		</select>

		{assign branch = $page.selected_branch}
		<span>Base: <a href="{@'/forum/thread/' + $branch.history[0]?.topic_id}">{@$branch.history[0]?.name} ({@$branch.history[0]?.id || '-'})</a></span>

		<span style="flex: 1;"></span>
		<span style="display: flex; column-gap: 3px; align-items: baseline;">
			<span>Pull changes from</span>
			<select class="pull_branch">
				{for branch of $branches}
					{if $branch == $page.selected_branch}{continue}{/if}
					<option value="{@$branch.id}" {if $page.selected_branch == $branch}selected="true"{/if}>{@$branch.id}. {@$branch.name.charAt(0).toUpperCase() + $branch.name.substring(1)} ({@$branch.history[0]?.id})</option>
				{/for}
			</select>
			<a class="button" href="javascript:void(0);" onclick="{serialize $page}.sync_branches(parseInt({serialize $page}.shadow.querySelector('.pull_branch').value), {serialize $page.selected_branch.id});">Pull</a>
		</span>

	</div>

	<div style="display: flex; column-gap: 15px; margin-top: 16px;">
		<div class="left">
			<h2 style="margin-top: 0px;">History:</h2>

			<table class="table projects" style="margin-top: 8px; width: 250px;">
				<tbody>
					{console.log('head: ' + $page.selected_branch.head_id)}
					{for project of $page.selected_branch.history}
						{assign is_head = $project.commit_id == $page.selected_branch.head_id}
						{console.log('commit: ' + $project.commit_id)}
						<tr class="{if $is_head}branch-head{/if} {if $project.is_removed || $project.is_being_removed}project-removed{/if}">
							<td style="width: 65px;" title="c {@$project.commit_id}">{@$project.id || '-'}</td>
							<td title="c {@$project.commit_id}"><a href="{@'/forum/thread/' + $project.topic_id}">{@$project.name}</a></td>
							{if !$project.is_removed && !$project.is_being_removed && !$project.removed_id}
								<td style="cursor: pointer;" onclick="{serialize $page}.unmerge({@$project.id});"><i class="fa fa-close"></i>
							{else}
								<td></td>
							{/if}
						</tr>
					{/for}
				</tbody>
			</table>
		</div>

		<div class="right" style="flex: 1;">

			<div class="tabMenuContainer staticTabMenuContainer">
				<nav class="tabMenu">
					<ul>
						<li><a href="javascript:void(0)" onclick="{serialize $page}.select_tab(0);">Merge</a></li>
						<li><a href="javascript:void(0)" onclick="{serialize $page}.select_tab(1);">Publish</a></li>
					</ul>
				</nav>

				<div style="margin-top: 8px;"></div>

				<div id="tab1" class="tab">
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
								<tr>
									<td style="width: 65px;">{@$project.id}</td>
									<td><a href="{@'/forum/thread/' + $project.topic_id}">{@$project.name}</a></td>
									<td>
										<a href="{@'/forum/thread/' + $project.base_topic_id}" title="{@$project.base_name || 'None'}">
											{if $project.can_be_merged}
												<i class="fa fa-check" style="color: green;"></i>
											{else}
												<i class="fa fa-close" style="color: red;"></i>
											{/if}
										</a>
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


				<div id="tab2" class="tab">
					<div>Message of the Day:</div>
					<textarea id="motd" style="margin-top: 8px; height: 300px;">{@$page.selected_branch.motd || ''}</textarea>
					<div>
						<a class="button" href="javascript:void(0);" onclick="{serialize $page}.set_motd();" style="margin-top: 8px;">Update MOTD</a>
					</div>
					<div style="display: flex; margin-top: 40px;">
						<span style="flex: 1;"></span>
						<div style="display: flex; flex-direction: column;">
							<span>Release:</span>
							<a class="button" href="javascript:void(0);" onclick="{serialize $page}.publish();" style="margin-top: 8px;">Release!</a>
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>

{@@
<style>
.mgContent h2 {
	font-size: 13px;
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

.mgContent .branch-head > td {
	background-color: #e2e0e0;
}

.mgContent .branch-head:hover > td {
	background-color: #cecccc;
}

.mgContent .project-removed {
	text-decoration: line-through;
}

</style>
@@}
</script>
