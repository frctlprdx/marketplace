<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class UserController extends Controller
{
    public function login(Request $request)
    {
        // Validasi input
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:8',
        ]);

        // Ambil status "remember_me" dari request
        $remember = $request->has('remember_me') && $request->remember_me; // Mengambil status "remember_me" dari request

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password], $remember)) {
            $user = Auth::user();

            $token = $user->createToken('marketplace')->plainTextToken;

            // Mengembalikan response dengan token dan role
            return response()->json([
                'success' => true,
                'message' => 'User logged in successfully',
                'token' => $token,
                'role' => $user->role,
            ]);
        }

        // Jika gagal login
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials',
        ], 401);
    }



    public function register(Request $request)
    {
        // Validasi inputan
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',  // password harus dikonfirmasi
            'role' => 'required',  // Role hanya bisa 'customer' atau 'seller'
            'address' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:15',
        ]);

        // Jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors(),
            ], 400);
        }

        // Buat user baru
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,  // Menentukan role (customer/seller)
            'address' => $request->address,
            'phone_number' => $request->phone_number,
        ]);

        // Buat token untuk user baru
        $token = $user->createToken('Marketplace')->plainTextToken;

        // Response sukses
        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'token' => $token,  // Kirim token
            'role' => $user->role,  // Kirim role
        ], 201);
    }
}
