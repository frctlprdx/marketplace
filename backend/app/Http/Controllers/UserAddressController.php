<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserShippingAddress;

class UserAddressController extends Controller
{
    public function index(Request $request)
{
    $userId = $request->query('user_id');

    if (!$userId) {
        return response()->json(['error' => 'user_id is required'], 400);
    }

    $addresses = UserShippingAddress::where('user_id', $userId)->get();
    return response()->json($addresses);
}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'nullable|string',
            'recipient_name' => 'required|string',
            'phone' => 'required|string',
            'province' => 'required|string',
            'city' => 'required|string',
            'district' => 'required|string',
            'subdistrict' => 'required|string',
            'zip_code' => 'required|string',
            'detail_address' => 'required|string',
            'is_default' => 'boolean',
        ]);

        $user = $request->user();

        // Jika is_default true, unset default sebelumnya
        if ($request->boolean('is_default')) {
            UserShippingAddress::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address = UserShippingAddress::create([
            ...$validated,
            'user_id' => $user->id,
        ]);

        return response()->json($address, 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $address = UserShippingAddress::where('id', $id)->where('user_id', $user->id)->first();

        if (!$address) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($address);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $address = UserShippingAddress::where('id', $id)->where('user_id', $user->id)->first();

        if (!$address) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'label' => 'nullable|string',
            'recipient_name' => 'required|string',
            'phone' => 'required|string',
            'province' => 'required|string',
            'city' => 'required|string',
            'district' => 'required|string',
            'subdistrict' => 'required|string',
            'zip_code' => 'required|string',
            'detail_address' => 'required|string',
            'is_default' => 'boolean',
        ]);

        if ($request->boolean('is_default')) {
            UserShippingAddress::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json($address);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $address = UserShippingAddress::where('id', $id)->where('user_id', $user->id)->first();

        if (!$address) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted']);
    }
}
