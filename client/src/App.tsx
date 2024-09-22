import { useEffect, useState } from "react";

type User = {
	id: number;
	name: string;
	age: number;
};

export default function App() {
	const [users, setUsers] = useState<Array<User>>();

	useEffect(() => {
		new Promise((r) => setTimeout(r, 2000))
			.then(() => fetch("/api/users"))
			.then((res) => res.json())
			.then((data) => setUsers(data));
	}, []);

	if (!users) return "loading...";

	return (
		<div className="w-full min-h-screen flex justify-center items-center">
			<table className="block">
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Age</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.id}>
							<td>{user.id}</td>
							<td>{user.name}</td>
							<td>{user.age}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
