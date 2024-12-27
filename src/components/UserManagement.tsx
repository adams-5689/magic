import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../configs/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";

interface User {
  id: string;
  email: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const fetchedUsers: User[] = [];
    querySnapshot.forEach((doc) => {
      fetchedUsers.push({ id: doc.id, ...doc.data() } as User);
    });
    setUsers(fetchedUsers);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    await updateDoc(doc(db, "users", userId), { role: newRole });
    fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteDoc(doc(db, "users", userId));
    fetchUsers();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button
                  onClick={() =>
                    handleUpdateRole(
                      user.id,
                      user.role === "admin" ? "user" : "admin"
                    )
                  }
                  variant="outline"
                  size="sm"
                  className="mr-2"
                >
                  {user.role === "admin" ? "Rétrograder" : "Promouvoir"}
                </Button>
                <Button
                  onClick={() => handleDeleteUser(user.id)}
                  variant="destructive"
                  size="sm"
                >
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
