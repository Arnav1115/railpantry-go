import 'package:flutter/material.dart';

class AuthProvider extends ChangeNotifier {
  String? _pnr;
  String? _mobile;
  bool _isLoggedIn = false;
  bool _isAdmin = false;

  String? get pnr => _pnr;
  String? get mobile => _mobile;
  bool get isLoggedIn => _isLoggedIn;
  bool get isAdmin => _isAdmin;

  // Passenger Login with 10-digit PNR Validation
  bool loginPassenger(String pnr, {String? mobile}) {
    if (pnr.length == 10 && RegExp(r'^[0-9]+$').hasMatch(pnr)) {
      _pnr = pnr;
      _mobile = mobile;
      _isLoggedIn = true;
      _isAdmin = false;
      notifyListeners();
      return true;
    }
    return false;
  }

  // Admin Login (Mocked)
  void loginAdmin(String email, String password) {
    // In a real app, connect to Supabase/Firebase here
    _isLoggedIn = true;
    _isAdmin = true;
    notifyListeners();
  }

  void logout() {
    _pnr = null;
    _mobile = null;
    _isLoggedIn = false;
    _isAdmin = false;
    notifyListeners();
  }
}
